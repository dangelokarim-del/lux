# LUXA — going live

The app runs in two modes, decided purely by environment variables:

| Mode | When | Backend |
| --- | --- | --- |
| **Demo** | no env set | in-memory store (seeded) — fully working, no infra |
| **Live** | Supabase env set | Postgres + Realtime + the WhatsApp/OpenAI pipeline |

No code changes are needed to switch — see `.env.example`.

---

## 1 · Supabase (Database, Auth, Realtime)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query →** paste `supabase/migrations/0001_init.sql` and run it.
   This creates the enums + 8 tables (Properties, Guests, Conversations, Messages,
   Tasks, Staff, Notifications, ActivityLog), indexes, RLS policies, the realtime
   publication, and a seeded Marbella portfolio.
3. **Authentication → Providers → Anonymous → enable.** The dashboard opens an
   anonymous session so RLS (which grants `authenticated` full access) works
   immediately. Swap this for real staff email/OAuth auth before production.
4. **Project Settings → API** → copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Realtime is already enabled for all tables by the migration, so every dashboard
updates instantly when any row changes.

## 2 · OpenAI (message → structured task)

Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default `gpt-4o-mini`).
Incoming messages are sent through OpenAI structured outputs and returned as a
strict extraction (intent, category, property, room, priority, department,
confidence). Without a key, a deterministic extractor stands in.

## 3 · WhatsApp Cloud API

1. In **Meta for Developers**, add the **WhatsApp** product and get a phone number.
2. Set `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
   and `WHATSAPP_APP_SECRET`.
3. **Configuration → Webhooks → Callback URL:** `https://YOUR_DOMAIN/api/whatsapp`
   **Verify token:** the same `WHATSAPP_VERIFY_TOKEN`. Subscribe to `messages`.

That's it. A real guest message now flows:

```
WhatsApp → /api/whatsapp (verified) → ingestInbound()
  → store message → OpenAI extract → create Task → notify → auto-reply (sent back on WhatsApp)
  → Supabase Realtime → every dashboard updates instantly
```

The dashboard's **Simulate message** button posts to `/api/messages/simulate`,
which runs the *exact same* `ingestInbound()` pipeline — so a demo message and a
real one are indistinguishable downstream.

## Architecture (where to look)

```
lib/domain/            reusable models + enums (≈ the SQL schema)
lib/config.ts          env → isLive(); no hardcoded secrets anywhere
lib/supabase/          browser + admin clients, row↔domain mappers, row types
lib/services/ai/       AiExtractor interface · Mock + OpenAI implementations
lib/services/whatsapp/ Cloud API webhook parse + outbound send
lib/server/ingest.ts   the production pipeline (Supabase + AI)
lib/store/             OpsGateway interface · LuxaStore (memory) · SupabaseLiveStore (realtime)
app/api/whatsapp       webhook (GET verify · POST receive, signature-checked)
app/api/messages/...   simulate endpoint (same pipeline)
components/product/    the Operations dashboard, task detail, simulator, notifications
```

Staff actions (assign, status, notes, complete) persist to Postgres and broadcast
over realtime, so every connected client updates instantly.
