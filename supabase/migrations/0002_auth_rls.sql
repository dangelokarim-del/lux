-- ============================================================================
--  LUXA — staff authentication, membership-scoped RLS, and storage (v2)
--  Turns the single-operator demo into a real multi-staff SaaS:
--   • staff are linked to Supabase Auth accounts by email
--   • every table is readable/writable only by an active staff member
--   • a private bucket is provisioned for guest-message media
-- ============================================================================

-- ----------------------------------------------------------------------------
--  1 · Link staff records to auth accounts
-- ----------------------------------------------------------------------------
alter table staff add column if not exists email text unique;

-- Seed staff get stable emails so the operator can invite them (Auth → Invite).
update staff set email = 'carlos@luxa.app' where id = '33333333-3333-3333-3333-333333333301' and email is null;
update staff set email = 'diego@luxa.app'  where id = '33333333-3333-3333-3333-333333333302' and email is null;
update staff set email = 'marta@luxa.app'  where id = '33333333-3333-3333-3333-333333333303' and email is null;
update staff set email = 'elena@luxa.app'  where id = '33333333-3333-3333-3333-333333333304' and email is null;
update staff set email = 'lucia@luxa.app'  where id = '33333333-3333-3333-3333-333333333305' and email is null;
update staff set email = 'sofia@luxa.app'  where id = '33333333-3333-3333-3333-333333333306' and email is null;
update staff set email = 'andres@luxa.app' where id = '33333333-3333-3333-3333-333333333307' and email is null;

-- When an auth user is created (invited / signs in), bind it to its staff row
-- by email and bring them online. Runs as definer so it can touch staff.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update staff set user_id = new.id, presence = 'available'
  where lower(email) = lower(new.email) and user_id is null;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
--  2 · Membership check — definer so it bypasses RLS (no recursive policy)
-- ----------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

-- ----------------------------------------------------------------------------
--  3 · Replace the permissive demo policies with staff-scoped ones
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['properties','guests','staff','conversations','tasks','messages','activity_log','notifications']
  loop
    execute format('drop policy if exists "authenticated full access" on %I', t);
    execute format('drop policy if exists "staff access" on %I', t);
    execute format(
      'create policy "staff access" on %I for all to authenticated using (public.is_staff()) with check (public.is_staff())',
      t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
--  4 · Storage — a private bucket for guest-message media (photos of issues,
--      documents). Reserved/ready; staff-only access. No public URLs.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

drop policy if exists "staff media read" on storage.objects;
drop policy if exists "staff media write" on storage.objects;
create policy "staff media read"  on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_staff());
create policy "staff media write" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());

-- ----------------------------------------------------------------------------
--  5 · Table privileges. Supabase grants these to `authenticated` by default;
--      declaring them keeps the migration self-contained (RLS still gates rows).
-- ----------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
