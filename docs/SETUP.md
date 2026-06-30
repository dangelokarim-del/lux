# LUXA — production setup

The app runs in two modes, decided purely by environment variables:

| Mode | When | Backend |
| --- | --- | --- |
| **Demo** | no env set | in-memory store (seeded) — fully working, no infra, no auth wall |
| **Live** | Supabase env set | Postgres + Realtime + staff auth + the WhatsApp/OpenAI pipeline |

No code changes are needed to switch — see `.env.example`. In live mode the
Next.js middleware gates every dashboard route behind an authenticated staff
session.

---

## Go live in three steps

1. **Create a Supabase project** and deploy the schema.
2. **Paste the keys** into your env (`.env.local` locally, project env on Vercel).
3. **Deploy to Vercel.**

Everything below is the detail behind those three steps.

---

## 1 · Supabase — database, auth, realtime

Two migrations under `supabase/migrations/`, both validated end-to-end against
PostgreSQL 16:

- `0001_init.sql` — enums + 8 tables (Properties, Guests, Conversations,
  Messages, Tasks, Staff, Notifications, ActivityLog), indexes, the `updated_at`
  trigger, realtime publication, and a seeded, fully-linked Marbella portfolio.
- `0002_auth_rls.sql` — staff↔auth linking, membership-scoped RLS (only an active
  staff member can read/write), and a private `media` storage bucket.

Create a project at [supabase.com](https://supabase.com), then deploy:

```bash
supabase link --project-ref <your-project-ref>   # npm run db:link
supabase db push                                  # npm run db:push
```

(Or paste both SQL files into the **SQL editor** in order.) `supabase/config.toml`
is committed — email auth on, **public signups and anonymous sign-ins off**
(invite-only staff). Apply it with `supabase config push`, or mirror it in
**Authentication → Sign In / Providers**.

Then **Project Settings → API** → copy into your env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only — never exposed to the browser)

### Staff accounts

Auth is invite-only and scoped by the `staff` table. A user can sign in **only if
their email matches a `staff` row** — a trigger links the auth account to the
staff record on first sign-in (and brings them online).

The seed ships 7 staff with `@luxa.app` emails (e.g. `carlos@luxa.app`). To
onboard real staff:

1. Make sure a `staff` row exists with the person's email
   (`update staff set email = 'you@yourco.com' where name = '…';`, or insert a new
   row). **Do this for yourself first** so you can get in.
2. **Authentication → Users → Add user / Invite** with that same email.
3. They sign in at `/login`; RLS immediately scopes them to the operation.

Realtime is enabled for all 8 tables, so every connected dashboard updates the
instant any row changes.

### Local development (optional, needs Docker)

`npm run db:start` boots the full Supabase stack and applies the migrations;
`npm run db:reset` reapplies from scratch; `npm run db:types` regenerates
`lib/supabase/database.types.ts`. Point your env at the URL/keys it prints.

## 2 · OpenAI — message → structured task

Set `OPENAI_API_KEY` (optionally `OPENAI_MODEL`, default `gpt-4o-mini`). Messages
go through OpenAI structured outputs → a strict extraction (intent, category,
property, room, priority, department, confidence). Without a key, a deterministic
extractor stands in so the pipeline still works.

## 3 · WhatsApp Cloud API

1. In **Meta for Developers**, add the **WhatsApp** product and a phone number.
2. Set `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
   `WHATSAPP_APP_SECRET`.
3. **Configuration → Webhooks → Callback URL:** `https://YOUR_DOMAIN/api/whatsapp`,
   **Verify token:** the same `WHATSAPP_VERIFY_TOKEN`. Subscribe to `messages`.

A real guest message then flows:

```
WhatsApp → /api/whatsapp (signature-verified) → ingestInbound()
  → persist message → OpenAI extract → create Task → notify → auto-reply (sent on WhatsApp)
  → Supabase Realtime → every dashboard updates instantly
```

The dashboard's **New message** composer posts to `/api/messages/simulate`, which
runs the *exact same* `ingestInbound()` pipeline — a manual message and a real
WhatsApp one are indistinguishable downstream.

## 4 · Deploy to Vercel

1. Import the repo into Vercel (framework auto-detected; `vercel.json` pins the
   build + region).
2. **Project Settings → Environment Variables** → add the same variables from
   `.env.example` (the Supabase trio is required; OpenAI/WhatsApp optional).
3. Deploy. Verify with **`GET /api/health`** — it reports the active mode and
   which integrations are wired (booleans only, no secrets).

That's the whole production surface: create the project, paste the keys, deploy.

## Architecture (where to look)

```
middleware.ts          route protection — redirects unauthenticated staff to /login (live mode)
lib/config.ts          env → isLive(); no hardcoded secrets anywhere
lib/supabase/          browser + server (SSR cookie) + admin (service-role) clients, mappers, types
lib/supabase/middleware.ts  session refresh + gate used by middleware.ts
lib/services/ai/       AiExtractor interface · OpenAI + deterministic fallback
lib/services/whatsapp/ Cloud API webhook parse + outbound send
lib/server/ingest.ts   the production pipeline (Supabase + AI)
lib/store/             OpsGateway · LuxaStore (memory demo) · SupabaseLiveStore (realtime)
app/api/whatsapp       webhook (GET verify · POST receive, signature-checked)
app/api/messages/...   manual-entry endpoint (same pipeline)
app/api/health         deploy verification
supabase/migrations/   0001 schema+seed · 0002 auth/RLS/storage
```

Staff actions (assign, status, priority, notes, complete) persist to Postgres and
broadcast over realtime; RLS scopes everything to active staff members.
