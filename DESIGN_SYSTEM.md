# LUXA Design System

The single source of truth for how LUXA looks and feels. Build every new page
from these primitives — never re-style from scratch, never hardcode a status
color, never copy a button class.

## Principles

Ultra minimal · Apple × Linear · black-first · white typography · premium
spacing · huge type · smooth motion · rounded corners · thin borders · premium
shadows · beautiful hover.

## Tokens — `app/globals.css`

All design values live in the `@theme` block. Change them in one place and the
whole platform updates.

| Token | Purpose |
| --- | --- |
| `--color-bg`, `--color-bg-elev` | pure-black surfaces |
| `--color-ink` … `--color-ink-4` | white type at decreasing opacity |
| `--color-line`, `--color-line-2` | hairline borders |
| `--color-accent`, `--color-accent-soft` | the one electric-blue accent |
| `--color-urgent / warn / ok` | semantic status hues |
| `--radius-control / card / pill` | corner radii |
| `--shadow-card / pop / accent` | premium shadows |
| `--ease-premium` | shared motion curve |

Semantic status colors are mapped once in **`lib/tone.ts`** (`Tone` =
`neutral | accent | urgent | warn | ok | muted`). Badges, pills and dots all read
from it.

## Components — `components/ui/`

Import everything from the barrel: `import { Button, Card } from "@/components/ui"`.

| Component | Notes |
| --- | --- |
| `Button` / `buttonVariants` | variants: `accent · secondary · ghost · subtle · danger`; sizes `sm · md · lg · icon`; `loading`. Use `buttonVariants()` to style a `<Link>`. |
| `Input` · `Textarea` · `Field` | `Field` adds label + hint/error; `Input` supports `icon` + `invalid`. |
| `Card` · `CardHeader` · `CardBody` · `CardFooter` | the panel frame + optional `hover`. |
| `Table` · `THead` · `TBody` · `Tr` · `Th` · `Td` · `Row` | semantic table primitives; `Row` is the shared list-row (divider + hover). |
| `Badge` · `StatusBadge` · `VillaStateTag` | tone-driven chips. |
| `StatusPill` · `PriorityTag` · `PresenceTag` | dot + label. |
| `StatusDot` · `PresenceDot` | bare status dot. |
| `StatCard` | metric tile. |
| `Search` · `SearchTrigger` | full input / ⌘K trigger. |
| `EmptyState` | icon + title + description + action. |
| `Spinner` · `Skeleton` · `SkeletonText` · `LoadingState` | loading states. |
| `Avatar` | initials avatar. |
| `Logo` · `Wordmark` | compact mark / large chrome wordmark with accent dot. |

## Rules for scaling to hundreds of pages

1. **Compose, don't restyle.** New screens are arrangements of these primitives.
2. **No raw status colors.** Go through `tone.ts` / the badge + pill components.
3. **No ad-hoc buttons or inputs.** Use `Button` / `Input` (or `buttonVariants`).
4. **One import surface.** Always import from `@/components/ui`.
5. **App-specific composites** (sidebar, topbar, task table, widgets) live in
   `components/app/` and are themselves built from `components/ui`.
