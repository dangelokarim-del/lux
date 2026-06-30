-- ============================================================================
--  LUXA — operations platform schema (v1)
--  Run in the Supabase SQL editor (or `supabase db push`). Idempotent-ish:
--  safe to run once on a fresh project.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  Enums (mirror lib/domain/enums.ts exactly)
-- ----------------------------------------------------------------------------
create type department       as enum ('maintenance','housekeeping','concierge','security','front_desk');
create type task_category    as enum ('maintenance','housekeeping','concierge','fnb','transport','security','other');
create type priority         as enum ('urgent','high','normal','low');
create type task_status      as enum ('new','in_progress','on_hold','completed','cancelled');
create type intent           as enum ('issue','request','question','complaint','feedback');
create type channel          as enum ('whatsapp','email','call','in_app');
create type property_status  as enum ('occupied','arriving','cleaning','vacant');
create type presence         as enum ('available','busy','off');
create type notification_kind as enum ('new_task','status_change','assignment','message');
create type activity_type    as enum ('created','note','status_change','assignment','completed');
create type msg_direction    as enum ('inbound','outbound');

-- ----------------------------------------------------------------------------
--  Helper: updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
--  Tables
-- ----------------------------------------------------------------------------
create table properties (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  area          text not null,
  bedrooms      int  not null default 0,
  status        property_status not null default 'vacant',
  rooms         text[] not null default '{}',
  created_at    timestamptz not null default now()
);

create table guests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null unique,           -- E.164, the WhatsApp identity
  locale        text not null default 'en',
  property_id   uuid references properties(id) on delete set null,
  vip           boolean not null default false,
  check_in      timestamptz,
  check_out     timestamptz,
  created_at    timestamptz not null default now()
);

-- a property's current guest (added after guests exists to avoid a cycle)
alter table properties add column current_guest_id uuid references guests(id) on delete set null;

create table staff (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,  -- links to Supabase Auth
  name          text not null,
  role          text not null,
  department    department not null,
  presence      presence not null default 'off',
  initials      text not null,
  created_at    timestamptz not null default now()
);

create table conversations (
  id              uuid primary key default gen_random_uuid(),
  channel         channel not null default 'whatsapp',
  property_id     uuid references properties(id) on delete set null,
  guest_id        uuid references guests(id) on delete set null,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table tasks (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  title           text not null,
  description     text,
  category        task_category not null,
  department      department not null,
  priority        priority not null default 'normal',
  intent          intent,
  status          task_status not null default 'new',
  property_id     uuid references properties(id) on delete set null,
  room            text,
  assignee_id     uuid references staff(id) on delete set null,
  guest_id        uuid references guests(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  source_message_id uuid,                        -- set after the message is inserted
  ai_confidence   real,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);
create trigger tasks_updated_at before update on tasks for each row execute function set_updated_at();

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction       msg_direction not null,
  channel         channel not null default 'whatsapp',
  body            text not null,
  author          text not null,
  external_id     text,                          -- WhatsApp wamid
  extraction      jsonb,                         -- the AI extraction for this message
  task_id         uuid references tasks(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table activity_log (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id) on delete cascade,
  actor_id    uuid references staff(id) on delete set null,
  actor_name  text not null,
  type        activity_type not null default 'note',
  body        text not null,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  kind        notification_kind not null,
  title       text not null,
  body        text not null,
  task_id     uuid references tasks(id) on delete cascade,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  Indexes
-- ----------------------------------------------------------------------------
create index idx_tasks_status      on tasks(status);
create index idx_tasks_property    on tasks(property_id);
create index idx_tasks_assignee    on tasks(assignee_id);
create index idx_tasks_created     on tasks(created_at desc);
create index idx_messages_conv     on messages(conversation_id, created_at);
create index idx_activity_task     on activity_log(task_id, created_at);
create index idx_notifications_new on notifications(read, created_at desc);
create index idx_guests_phone      on guests(phone);

-- ----------------------------------------------------------------------------
--  Row Level Security
--  Internal staff tool: any authenticated session has full access. The webhook
--  uses the service-role key and bypasses RLS. Tighten with an org_id / staff
--  membership check before exposing beyond a single operator.
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['properties','guests','staff','conversations','tasks','messages','activity_log','notifications']
  loop
    execute format('alter table %I enable row level security', t);
    execute format($p$create policy "authenticated full access" on %I for all to authenticated using (true) with check (true)$p$, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
--  Realtime — broadcast row changes to subscribed clients
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table properties, guests, staff, conversations, tasks, messages, activity_log, notifications;

-- ============================================================================
--  Seed — a believable Marbella portfolio so the dashboard is alive on day one
-- ============================================================================
with p as (
  insert into properties (id, name, area, bedrooms, status, rooms) values
    ('11111111-1111-1111-1111-111111111101','Villa Ocean','Golden Mile',6,'occupied',  array['Master Bedroom','Guest Bedroom','Master Bathroom','Kitchen','Living Room','Pool','Terrace','Cinema Room','Gym']),
    ('11111111-1111-1111-1111-111111111102','Villa Sol','Sierra Blanca',5,'occupied',  array['Master Bedroom','Guest Bedroom','Kitchen','Living Room','Pool','Terrace']),
    ('11111111-1111-1111-1111-111111111103','Villa Sierra','El Madroñal',7,'occupied', array['Master Bedroom','Guest Bedroom','Kitchen','Living Room','Pool','Terrace','Gym']),
    ('11111111-1111-1111-1111-111111111104','Villa Aura','La Zagaleta',7,'arriving',   array['Master Bedroom','Guest Bedroom','Kitchen','Living Room','Pool']),
    ('11111111-1111-1111-1111-111111111105','Villa Mar','Puerto Banús',4,'cleaning',   array['Master Bedroom','Kitchen','Living Room','Pool']),
    ('11111111-1111-1111-1111-111111111106','Villa Luz','Nueva Andalucía',5,'vacant',  array['Master Bedroom','Kitchen','Living Room','Pool'])
  returning id
) select 1;

insert into guests (id, name, phone, locale, property_id, vip) values
  ('22222222-2222-2222-2222-222222222201','James Whitmore','+447700900123','en','11111111-1111-1111-1111-111111111101',true),
  ('22222222-2222-2222-2222-222222222202','Sophie Laurent','+33612345678','fr','11111111-1111-1111-1111-111111111102',false),
  ('22222222-2222-2222-2222-222222222203','Mohammed Al-Rashid','+971501234567','en','11111111-1111-1111-1111-111111111103',true);

update properties set current_guest_id = '22222222-2222-2222-2222-222222222201' where id = '11111111-1111-1111-1111-111111111101';
update properties set current_guest_id = '22222222-2222-2222-2222-222222222202' where id = '11111111-1111-1111-1111-111111111102';
update properties set current_guest_id = '22222222-2222-2222-2222-222222222203' where id = '11111111-1111-1111-1111-111111111103';

insert into staff (id, name, role, department, presence, initials) values
  ('33333333-3333-3333-3333-333333333301','Carlos Núñez','Maintenance Lead','maintenance','available','CN'),
  ('33333333-3333-3333-3333-333333333302','Diego Romero','Maintenance Technician','maintenance','busy','DR'),
  ('33333333-3333-3333-3333-333333333303','Marta Gil','Head Housekeeper','housekeeping','available','MG'),
  ('33333333-3333-3333-3333-333333333304','Elena Costa','Housekeeper','housekeeping','busy','EC'),
  ('33333333-3333-3333-3333-333333333305','Lucía Fernández','Lead Concierge','concierge','available','LF'),
  ('33333333-3333-3333-3333-333333333306','Sofía Vidal','Concierge','concierge','off','SV'),
  ('33333333-3333-3333-3333-333333333307','Andrés Soto','Security','security','available','AS');

insert into tasks (code, title, description, category, department, priority, intent, status, property_id, room, assignee_id, guest_id, ai_confidence, created_at, updated_at) values
  ('REQ-1041','Airport transfer — 4 guests','Arrival transfer for this evening.','transport','concierge','high','request','in_progress','11111111-1111-1111-1111-111111111102',null,'33333333-3333-3333-3333-333333333305','22222222-2222-2222-2222-222222222202',0.94, now() - interval '38 min', now() - interval '12 min'),
  ('REQ-1040','Private chef — dinner for 6','Tonight, Mediterranean menu.','fnb','concierge','normal','request','new','11111111-1111-1111-1111-111111111103',null,null,'22222222-2222-2222-2222-222222222203',0.90, now() - interval '54 min', now() - interval '54 min'),
  ('REQ-1039','Pre-arrival inspection','Full walkthrough before check-in.','housekeeping','housekeeping','normal','request','in_progress','11111111-1111-1111-1111-111111111104',null,'33333333-3333-3333-3333-333333333303',null,null, now() - interval '2 hour', now() - interval '20 min'),
  ('REQ-1038','Restock pool bar & towels',null,'housekeeping','housekeeping','low','request','on_hold','11111111-1111-1111-1111-111111111101','Pool','33333333-3333-3333-3333-333333333304',null,null, now() - interval '3 hour', now() - interval '1 hour'),
  ('REQ-1035','Spa booking — couples massage','Booked for 17:00.','concierge','concierge','normal','request','completed','11111111-1111-1111-1111-111111111101',null,'33333333-3333-3333-3333-333333333305','22222222-2222-2222-2222-222222222201',0.92, now() - interval '5 hour', now() - interval '4 hour'),
  ('REQ-1033','Welcome champagne & flowers',null,'concierge','concierge','normal','request','completed','11111111-1111-1111-1111-111111111103',null,'33333333-3333-3333-3333-333333333306','22222222-2222-2222-2222-222222222203',null, now() - interval '6 hour', now() - interval '5 hour');

update tasks set completed_at = updated_at where status = 'completed';

insert into notifications (kind, title, body, task_id, read, created_at)
select 'new_task','New request','Private chef — dinner for 6 · Villa Sierra', id, false, now() - interval '54 min' from tasks where code = 'REQ-1040';
