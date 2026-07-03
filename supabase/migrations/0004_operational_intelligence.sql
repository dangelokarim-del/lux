-- ============================================================================
--  LUXA — operational intelligence layer (v4)
--
--  Persistence-ready structures behind the autonomous AI Operations Manager:
--    • Shift schedules + manual availability overrides on team_members, so the
--      Smart Availability engine can be computed server-side and by SQL.
--    • Escalation routing: fallback managers + an Operations Manager flag.
--    • Map-ready coordinates on properties and last-known location on staff
--      (foundation for the live GPS map — no live tracking yet).
--    • Guest memory: VIP tier, standing preferences, recurring requests, prior
--      stays and concierge notes (personalisation foundation).
--
--  Idempotent: every change is guarded with IF NOT EXISTS / enum-exists checks,
--  so it is safe to re-run. Depends on 0003_multitenant.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  0 · Availability override enum ("auto" lets LUXA compute from the schedule)
-- ----------------------------------------------------------------------------
do $$ begin
  create type availability_override as enum ('auto','available','busy','off','leave');
exception when duplicate_object then null; end $$;

do $$ begin
  create type location_status as enum ('unknown','active','stale');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
--  1 · Team schedule + routing + location
--      working_days: ISO-ish day numbers 0=Sun … 6=Sat (default Mon–Fri)
-- ----------------------------------------------------------------------------
alter table team_members add column if not exists working_days         int[]  not null default '{1,2,3,4,5}';
alter table team_members add column if not exists shift_start          text;              -- 'HH:MM'
alter table team_members add column if not exists shift_end            text;
alter table team_members add column if not exists break_start          text;
alter table team_members add column if not exists break_end            text;
alter table team_members add column if not exists fallback_manager_id  uuid references team_members(id) on delete set null;
alter table team_members add column if not exists is_manager           boolean not null default false;
alter table team_members add column if not exists availability_override availability_override not null default 'auto';
alter table team_members add column if not exists leave_until          timestamptz;

alter table team_members add column if not exists last_known_lat       double precision;
alter table team_members add column if not exists last_known_lng       double precision;
alter table team_members add column if not exists last_location_at     timestamptz;
alter table team_members add column if not exists location_status      location_status not null default 'unknown';

-- ----------------------------------------------------------------------------
--  2 · Property map-ready coordinates
-- ----------------------------------------------------------------------------
alter table properties add column if not exists latitude  double precision;
alter table properties add column if not exists longitude double precision;

-- ----------------------------------------------------------------------------
--  3 · Guest memory (personalisation foundation)
-- ----------------------------------------------------------------------------
alter table guests add column if not exists vip_level             text;
alter table guests add column if not exists preferences           text[] not null default '{}';
alter table guests add column if not exists recurring_requests    text[] not null default '{}';
alter table guests add column if not exists previous_property_ids uuid[] not null default '{}';
alter table guests add column if not exists notes                 text;

-- ----------------------------------------------------------------------------
--  4 · Helpful index for escalation lookups (one manager per org)
-- ----------------------------------------------------------------------------
create index if not exists idx_team_manager on team_members(organization_id) where is_manager;
