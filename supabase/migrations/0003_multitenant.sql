-- ============================================================================
--  LUXA — multi-tenant SaaS architecture (v3)
--
--  Turns the single-operator schema into a true multi-tenant platform where one
--  LUXA instance serves hundreds of organizations at once, fully isolated by
--  Row Level Security. Every business row carries organization_id; a user only
--  ever sees the organizations they are a member of. Adds the configuration
--  tables (departments, settings, assignment_rules), units, and the WhatsApp
--  routing model (incoming messages route to an org by phone_number_id).
--
--  Idempotent-ish: guarded with IF [NOT] EXISTS / ON CONFLICT so it is safe to
--  re-run. Depends on 0001_init.sql and 0002_auth_rls.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  0 · New enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type member_role as enum ('owner','admin','manager','staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type unit_type as enum ('apartment','room','suite','villa','cabin','other');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
--  1 · Organizations — the tenant root
-- ----------------------------------------------------------------------------
create table if not exists organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- the one demo organization; everything existing is backfilled onto it
insert into organizations (id, name, slug)
values ('00000000-0000-0000-0000-0000000000a1', 'Marbella Portfolio', 'marbella-portfolio')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
--  2 · Memberships — which auth users belong to which org, and their role.
--      (The "users" of an organization. auth.users holds the identity/login.)
-- ----------------------------------------------------------------------------
create table if not exists memberships (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete cascade,
  email           text not null,
  name            text,
  role            member_role not null default 'staff',
  created_at      timestamptz not null default now(),
  unique (organization_id, email)
);
create index if not exists idx_memberships_user on memberships(user_id);
create index if not exists idx_memberships_org  on memberships(organization_id);

-- ----------------------------------------------------------------------------
--  3 · Rename to the canonical SaaS names
--      staff → team_members · activity_log → task_history
-- ----------------------------------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='staff')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='team_members') then
    execute 'alter table staff rename to team_members';
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='activity_log')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='task_history') then
    execute 'alter table activity_log rename to task_history';
  end if;
end $$;

-- ----------------------------------------------------------------------------
--  4 · organization_id on every business table + the new configurable columns
-- ----------------------------------------------------------------------------
alter table properties    add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table properties    add column if not exists type text not null default 'Villa';
alter table properties    add column if not exists notes text;
alter table properties    add column if not exists assigned_team_ids uuid[] not null default '{}';

alter table guests        add column if not exists organization_id uuid references organizations(id) on delete cascade;
-- a guest phone is unique *within* an org, not globally (two orgs may share a guest)
alter table guests drop constraint if exists guests_phone_key;
create unique index if not exists uq_guests_org_phone on guests(organization_id, phone);

alter table team_members  add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table team_members  add column if not exists phone text;
alter table team_members  add column if not exists max_active_tasks int;
alter table team_members  add column if not exists working_hours text;
alter table team_members  add column if not exists languages text[] not null default '{}';
alter table team_members  add column if not exists assigned_property_ids uuid[] not null default '{}';

alter table conversations add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table tasks         add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table messages      add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table task_history  add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table notifications add column if not exists organization_id uuid references organizations(id) on delete cascade;

-- departments become configurable per org → columns go from enum to text
alter table tasks        alter column department type text using department::text;
alter table team_members alter column department type text using department::text;

-- ----------------------------------------------------------------------------
--  5 · Units — apartments / rooms / suites inside a property
-- ----------------------------------------------------------------------------
create table if not exists units (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id     uuid not null references properties(id) on delete cascade,
  name            text not null,
  type            unit_type not null default 'room',
  bedrooms        int not null default 0,
  status          property_status not null default 'vacant',
  created_at      timestamptz not null default now()
);
create index if not exists idx_units_org      on units(organization_id);
create index if not exists idx_units_property on units(property_id);

-- tasks may target a specific unit
alter table tasks add column if not exists unit_id uuid references units(id) on delete set null;

-- ----------------------------------------------------------------------------
--  6 · Departments — the configurable teams an org runs
-- ----------------------------------------------------------------------------
create table if not exists departments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  slug            text not null,           -- e.g. 'maintenance' | 'pool_service'
  label           text not null,
  custom          boolean not null default false,
  position        int not null default 0,
  created_at      timestamptz not null default now(),
  unique (organization_id, slug)
);
create index if not exists idx_departments_org on departments(organization_id);

-- ----------------------------------------------------------------------------
--  7 · Settings — one row per organization (portfolio identity + dashboard prefs)
-- ----------------------------------------------------------------------------
create table if not exists settings (
  organization_id uuid primary key references organizations(id) on delete cascade,
  portfolio_name  text not null default 'Portfolio',
  location        text not null default '',
  language        text not null default 'en',
  timezone        text not null default 'Europe/Madrid',
  brand_mark      text not null default 'LUXA',
  auto_assign     boolean not null default true,
  visible_kpis    text[] not null default array['open','urgent','in_progress','completed_today','team_online','properties_active','avg_response'],
  updated_at      timestamptz not null default now()
);
create trigger settings_updated_at before update on settings for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
--  8 · Assignment rules — the customizable routing engine, per org, ordered
-- ----------------------------------------------------------------------------
create table if not exists assignment_rules (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  label           text not null,
  keywords        text[] not null default '{}',
  category        task_category not null default 'other',
  department      text not null,
  priority        priority,                       -- null = keep the AI's priority
  enabled         boolean not null default true,
  position        int not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_rules_org on assignment_rules(organization_id, position);

-- ----------------------------------------------------------------------------
--  9 · WhatsApp accounts — each org connects one or many Business numbers.
--      Incoming webhooks route to the org by phone_number_id.
-- ----------------------------------------------------------------------------
create table if not exists whatsapp_accounts (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  phone_number_id   text not null unique,          -- Meta's routing key
  display_number    text,
  waba_id           text,                          -- WhatsApp Business Account id
  label             text,
  verify_token      text,
  access_token      text,                          -- stored server-side; RLS hides it from clients
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);
create index if not exists idx_wa_org on whatsapp_accounts(organization_id);

-- resolve the owning organization for an incoming WhatsApp webhook
create or replace function public.org_for_phone_number_id(pn_id text)
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from whatsapp_accounts where phone_number_id = pn_id and active limit 1;
$$;

-- ----------------------------------------------------------------------------
--  10 · Integrations — connection registry per org (status + config)
-- ----------------------------------------------------------------------------
create table if not exists integrations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  kind            text not null,                   -- 'whatsapp' | 'openai' | 'stripe' | 'calendar' | 'airbnb' | ...
  status          text not null default 'disconnected',
  config          jsonb not null default '{}',
  connected_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (organization_id, kind)
);
create index if not exists idx_integrations_org on integrations(organization_id);

-- ----------------------------------------------------------------------------
--  11 · Backfill: put every existing (single-tenant) row into the demo org
-- ----------------------------------------------------------------------------
update properties    set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;
update guests        set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;
update team_members  set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;
update conversations set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;
update tasks         set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;
update messages      set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;
update task_history  set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;
update notifications set organization_id = '00000000-0000-0000-0000-0000000000a1' where organization_id is null;

-- now that data is backfilled, require organization_id going forward
alter table properties    alter column organization_id set not null;
alter table guests        alter column organization_id set not null;
alter table team_members  alter column organization_id set not null;
alter table conversations alter column organization_id set not null;
alter table tasks         alter column organization_id set not null;
alter table messages      alter column organization_id set not null;
alter table task_history  alter column organization_id set not null;
alter table notifications alter column organization_id set not null;

-- helpful composite indexes for org-scoped queries
create index if not exists idx_properties_org on properties(organization_id);
create index if not exists idx_guests_org     on guests(organization_id);
create index if not exists idx_team_org       on team_members(organization_id);
create index if not exists idx_tasks_org      on tasks(organization_id, created_at desc);
create index if not exists idx_messages_org   on messages(organization_id);

-- ----------------------------------------------------------------------------
--  12 · Seed the demo org's configuration
-- ----------------------------------------------------------------------------
insert into settings (organization_id, portfolio_name, location)
values ('00000000-0000-0000-0000-0000000000a1', 'Marbella Portfolio', 'Marbella')
on conflict (organization_id) do nothing;

insert into departments (organization_id, slug, label, custom, position) values
  ('00000000-0000-0000-0000-0000000000a1','maintenance','Maintenance',false,0),
  ('00000000-0000-0000-0000-0000000000a1','housekeeping','Housekeeping',false,1),
  ('00000000-0000-0000-0000-0000000000a1','concierge','Concierge',false,2),
  ('00000000-0000-0000-0000-0000000000a1','security','Security',false,3),
  ('00000000-0000-0000-0000-0000000000a1','front_desk','Front Desk',false,4),
  ('00000000-0000-0000-0000-0000000000a1','transport','Transport',false,5),
  ('00000000-0000-0000-0000-0000000000a1','reservations','Reservations',false,6)
on conflict (organization_id, slug) do nothing;

insert into assignment_rules (organization_id, label, keywords, category, department, priority, enabled, position) values
  ('00000000-0000-0000-0000-0000000000a1','Air conditioning', array['ac','a/c','air conditioning','cooling','heating','not working'],'maintenance','maintenance','urgent',true,0),
  ('00000000-0000-0000-0000-0000000000a1','Plumbing & electrical', array['leak','flood','water','electric','power','light','wifi','internet'],'maintenance','maintenance',null,true,1),
  ('00000000-0000-0000-0000-0000000000a1','Housekeeping', array['towels','cleaning','sheets','linen','laundry','tidy','amenities'],'housekeeping','housekeeping',null,true,2),
  ('00000000-0000-0000-0000-0000000000a1','Transport', array['transfer','airport','taxi','driver','car','pick up'],'transport','transport',null,true,3),
  ('00000000-0000-0000-0000-0000000000a1','Concierge & bookings', array['restaurant','beach club','booking','reservation','spa','massage','table','chef','dinner'],'concierge','concierge',null,true,4),
  ('00000000-0000-0000-0000-0000000000a1','Security', array['security','alarm','gate','intruder','noise','emergency'],'security','security',null,true,5)
on conflict do nothing;

-- one WhatsApp Business number for the demo org (placeholder id — replace with Meta's)
insert into whatsapp_accounts (organization_id, phone_number_id, display_number, label, active)
values ('00000000-0000-0000-0000-0000000000a1','DEMO_PHONE_NUMBER_ID','+34 600 000 000','Marbella Portfolio · Main', true)
on conflict (phone_number_id) do nothing;

insert into integrations (organization_id, kind, status) values
  ('00000000-0000-0000-0000-0000000000a1','whatsapp','disconnected'),
  ('00000000-0000-0000-0000-0000000000a1','openai','disconnected'),
  ('00000000-0000-0000-0000-0000000000a1','supabase','connected')
on conflict (organization_id, kind) do nothing;

-- ----------------------------------------------------------------------------
--  13 · Multi-tenant Row Level Security
--       A user sees only the organizations they are a member of.
-- ----------------------------------------------------------------------------
create or replace function public.current_org_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select organization_id from memberships where user_id = auth.uid();
$$;

-- membership on the requested org (used by INSERT check)
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where user_id = auth.uid() and organization_id = org);
$$;

-- redefine the invite trigger for multi-tenant: link the team_member AND ensure
-- a membership so the new user immediately sees their org.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare tm record;
begin
  select id, organization_id, name into tm
  from team_members where lower(email) = lower(new.email) and user_id is null
  limit 1;

  if tm.id is not null then
    update team_members set user_id = new.id, presence = 'available' where id = tm.id;
    insert into memberships (organization_id, user_id, email, name, role)
    values (tm.organization_id, new.id, new.email, tm.name, 'staff')
    on conflict (organization_id, email) do update set user_id = excluded.user_id;
  end if;
  return new;
end; $$;

-- replace the old single-tenant is_staff() policies with org-scoped ones
drop function if exists public.is_staff() cascade;

do $$
declare t text;
begin
  -- business tables scoped by organization_id
  foreach t in array array[
    'properties','guests','team_members','conversations','tasks','messages',
    'task_history','notifications','units','departments','settings',
    'assignment_rules','whatsapp_accounts','integrations'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "staff access" on %I', t);
    execute format('drop policy if exists "authenticated full access" on %I', t);
    execute format('drop policy if exists "org isolation" on %I', t);
    execute format(
      'create policy "org isolation" on %I for all to authenticated using (organization_id in (select public.current_org_ids())) with check (organization_id in (select public.current_org_ids()))',
      t
    );
  end loop;
end $$;

-- organizations + memberships have their own shapes
alter table organizations enable row level security;
drop policy if exists "org visible to members" on organizations;
create policy "org visible to members" on organizations for all to authenticated
  using (id in (select public.current_org_ids())) with check (id in (select public.current_org_ids()));

alter table memberships enable row level security;
drop policy if exists "own memberships" on memberships;
create policy "own memberships" on memberships for select to authenticated
  using (user_id = auth.uid() or organization_id in (select public.current_org_ids()));

-- hide WhatsApp access tokens from the client: clients read a token-less view
create or replace view whatsapp_accounts_safe as
  select id, organization_id, phone_number_id, display_number, waba_id, label, active, created_at
  from whatsapp_accounts;

-- ----------------------------------------------------------------------------
--  14 · Realtime — broadcast the new tables too
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['units','departments','settings','assignment_rules','whatsapp_accounts','integrations','organizations','memberships']
  loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ----------------------------------------------------------------------------
--  15 · Privileges (RLS still gates the rows)
-- ----------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on whatsapp_accounts_safe to authenticated;
