# LUXA — Luxury. Automated.

The AI Operating System for luxury hospitality. A premium, clickable MVP demo —
landing page + product dashboard — built to show potential clients in Marbella.

> Every guest request becomes an organized operation.

This is a **front-end demo with mock data only**. There is no backend, no auth,
and no external APIs wired up — by design.

---

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first theme in `app/globals.css`)
- **Framer Motion** — entrance + scroll animations
- **Geist** font (self-hosted via npm, no Google Fonts dependency)
- **Lucide** icons (used sparingly)

## Design language

70% Linear / 30% Apple. Pure black, white type, fine hairline borders, a single
electric-blue accent (`#2e7dff`) used only for the primary CTA, active nav and
one status glow. Tiny uppercase mono labels, huge typography, lots of whitespace.

All design tokens live in `app/globals.css` under `@theme` — change the accent or
radii in one place.

---

## Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

Production build:

```bash
npm run build
npm run start
```

## Pages

| Route        | Description                                              |
| ------------ | -------------------------------------------------------- |
| `/`          | Landing — hero, problem, how-it-works flow, product, CTA |
| `/login`     | Mock sign-in (any credentials open the dashboard)        |
| `/dashboard` | Operations: stats, task table, requests, team, villas    |
| `/tasks`     | Task list with department filters                        |
| `/villas`    | Villa portfolio cards                                    |
| `/team`      | Team / staff status                                      |
| `/requests`  | Guest request inbox                                      |

## Project structure

```
app/
  page.tsx                 landing
  login/page.tsx           mock login
  (app)/                   dashboard route group (shared sidebar + topbar shell)
    layout.tsx
    dashboard/  tasks/  villas/  team/  requests/
  globals.css              design system + tokens
components/
  landing/                 hero, nav, sections, footer
  app/                     sidebar, topbar, stat cards, tables, widgets
  ui/                      logo, badges, avatar, status dots
lib/
  data.ts                  all mock data
  types.ts                 shared types
  utils.ts                 helpers
```

## Mock data

Everything the dashboard shows is in **`lib/data.ts`** — tasks, villas, team,
guest requests and the headline stats. Edit that one file to change the demo
content. It's typed against `lib/types.ts`, so a real backend can later return the
same shapes with minimal changes to the components.

## Deploy to Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Framework preset auto-detects **Next.js**. No environment variables are needed
   (there's no backend yet). Click **Deploy**.

That's it — Vercel builds and hosts it. Every push redeploys.

## What to test first

1. **Landing → Book a Demo** routes to `/login`.
2. **Login** (any credentials) opens `/dashboard`.
3. **Dashboard** shows the four stats, active tasks, recent requests, team and
   villas.
4. **Sidebar / bottom nav** moves between Dashboard, Tasks, Villas, Team,
   Guest Requests.
5. **Tasks** — department filter chips update the table live.
6. **Resize to an iPhone width** — confirm the bottom tab bar and 2-column stat
   layout.

---

Designed in Marbella. Luxury. Automated.
