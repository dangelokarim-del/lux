# LUXA — multi-tenant SaaS architecture

LUXA runs as **one instance serving many organizations**. Every business row
carries an `organization_id`; Postgres Row Level Security guarantees a user only
ever sees the organizations they belong to. There is no client-side demo data in
production — the in-memory store is a zero-infra fallback for local/demo only.

## Tenancy model

```
organizations ─┬─ memberships (auth.users ↔ org, role: owner/admin/manager/staff)
               ├─ settings            (1 row per org: portfolio, KPIs, branding…)
               ├─ departments         (built-in + custom teams)
               ├─ assignment_rules    (keyword → category/department routing)
               ├─ properties ─ units  (villas/apartments/hotels → rooms/suites)
               ├─ team_members        (staff the engine assigns work to)
               ├─ guests · conversations · messages
               ├─ tasks ─ task_history
               ├─ notifications
               ├─ whatsapp_accounts   (one or many Business numbers per org)
               └─ integrations        (connection registry)
```

Migrations (run in order in the Supabase SQL editor or `supabase db push`):

- `0001_init.sql` — core operations schema + seed
- `0002_auth_rls.sql` — staff auth linking + storage bucket
- `0003_multitenant.sql` — **organizations, memberships, org_id on every table,
  units/departments/settings/assignment_rules/whatsapp_accounts/integrations,
  org-scoped RLS, realtime, WhatsApp routing, one demo org**

## Isolation (RLS)

`0003` replaces the single-operator policies with org isolation. A security-definer
`current_org_ids()` returns the caller's org ids from `memberships`; every table
policy is:

```sql
using (organization_id in (select public.current_org_ids()))
with check (organization_id in (select public.current_org_ids()))
```

Proven on PostgreSQL 16: a Marbella member sees only Marbella's rows, an Ibiza
member sees only Ibiza's, and a user with no membership sees nothing.

## Persistence & realtime

The dashboard talks to Supabase through `SupabaseLiveStore` (`lib/store`):

- On load it resolves the caller's `organization_id` from `memberships`, then
  fetches every table scoped to that org and subscribes to `postgres_changes`.
- Every dashboard edit — add/edit/delete a property, unit, team member,
  department, assignment rule, or any setting — is written straight to Postgres
  and echoed back over realtime, so all connected clients update without a
  refresh. A client-side org guard drops any realtime row from another tenant.

Flip between backends automatically: set `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY` and the app uses Supabase; leave them unset and
it runs the in-memory demo.

## WhatsApp routing (many numbers → many orgs)

Each org connects one or more Business numbers in `whatsapp_accounts`
(`phone_number_id` is Meta's routing key, unique across the platform). The single
webhook at `/api/whatsapp` reads `phone_number_id` from the payload metadata and
calls `orgForPhoneNumberId()` to find the owning org, then `ingestInbound(msg,
organizationId)` runs the AI → routing-rules → auto-assignment pipeline entirely
within that org. A message that arrived on company A's number can never create a
task for company B.

Guest phone numbers are unique **per org** (not globally), so two organizations
may legitimately share a guest.

## Onboarding a new client

1. `insert into organizations (name, slug) …`
2. Add their team to `team_members` (with emails) and invite those emails in
   Supabase Auth — the `handle_new_user` trigger links each login to its
   team_member and creates a `memberships` row automatically.
3. Seed their `settings` row (or let defaults apply), departments and rules.
4. Register their WhatsApp number(s) in `whatsapp_accounts`.

That's it — the same running LUXA instance now serves them, fully isolated.
