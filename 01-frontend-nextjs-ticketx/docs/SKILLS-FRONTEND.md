# TicketX – SKILLS-FRONTEND.md

> Companion docs: `PROJECT-RULES-FRONTEND.md` (folder/naming rules) · `ARCHITECTURE-FRONTEND.md` (structure)

Maps the 7 design skills available in `.claude/skills/` to concrete TicketX frontend work, so Claude picks the right one instead of hand-rolling UI/design decisions. These are global Claude Code skills (invoked via the `Skill` tool, e.g. `/ui-styling`) — this doc only tells you **when** each one applies to this codebase.

---

## 1. Quick lookup

| Skill | Use it for | TicketX example |
|---|---|---|
| `ui-styling` | Building actual React components: shadcn/ui pieces, Tailwind classes, dark mode, accessible dialogs/forms | `SeatMap`, `BookingSummary`, `Modal`, `Input` in `shared/components` |
| `ui-ux-pro-max` | Deciding layout, color palette, typography, motion, UX pattern *before* writing component code | Choosing the seat-selection layout, showtime picker UX, movie detail page hierarchy |
| `design-system` | Defining/maintaining design tokens (spacing, color, type scale) shared across the app | Central Tailwind theme config, `shared/styles/tokens.ts` |
| `brand` | Keeping visual identity and copy tone consistent (logo usage, color palette, voice) | Header/logo placement, marketing copy on the homepage hero |
| `banner-design` | Generating promotional visuals | Movie promo banners, homepage hero art, campaign assets for vouchers |
| `slides` | HTML presentation decks (not app UI) | Internal pitch/status decks — rarely needed for the app itself |
| `design` | Umbrella skill covering logo/CIP/icon/banner/slide generation with AI-generated assets | One-off asset generation (app icon, favicon, poster placeholder art) when no dedicated skill fits |

---

## 2. Recommended order for a new UI feature

1. **`ui-ux-pro-max`** — decide the pattern: layout, color usage, spacing rhythm, UX guideline (e.g. how seat-map selection states should look/feel) for the target stack (`react`/`nextjs` in its `data/stacks/`).
2. **`design-system`** — confirm the choice maps to existing tokens (`tailwind-integration.md`, `component-tokens.md`); add new tokens only if genuinely missing, don't invent one-off values.
3. **`ui-styling`** — implement with shadcn/ui + Tailwind, following `shadcn-components.md` / `shadcn-accessibility.md` for accessible markup (dialogs, forms, focus states).
4. **`brand`** — sanity-check colors/copy/logo usage against brand guidelines before shipping anything customer-facing.
5. **`banner-design`** / **`design`** — only when the task needs a generated visual asset (promo banner, poster placeholder), not for component code.

Skip steps that don't apply — a small internal admin form doesn't need `banner-design` or `brand`.

---

## 3. TicketX-specific triggers

- **Seat map / booking flow UI** (`features/booking`) → `ui-ux-pro-max` for interaction states (locked/selected/booked seat colors — must stay legible in dark mode), then `ui-styling` for the actual grid + accessible seat buttons.
- **Movie/showtime browsing** (`features/movie`, `features/showtime`) → `ui-ux-pro-max` (`app-interface.csv`, `landing.csv`) for card/list patterns, `ui-styling` for shadcn `Card`/`Badge` implementation.
- **Admin screens** (movie/cinema/showtime/combo/voucher management) → `ui-styling` directly; these are data-table/form heavy, skip brand/banner steps.
- **Homepage hero, promo campaigns, voucher marketing** → `banner-design` or `design` for the visual, `brand` to check tone/colors match, `ui-styling` to place it responsively.
- **Design tokens / Tailwind theme changes** → always go through `design-system` first (`primitive-tokens.md` → `semantic-tokens.md` → `component-tokens.md`), then regenerate via its `generate-tokens.cjs` script rather than hand-editing `tailwind.config`.
- **QR e-ticket screen, check-in UI** → `ui-styling` only; no visual/brand asset generation needed.

---

## 4. What NOT to use these skills for

- Business logic, API integration, state management (Zustand/TanStack Query), routing — none of these skills cover that; follow `PROJECT-RULES-FRONTEND.md` instead.
- Backend/API changes — these skills are frontend/design-only.
- Don't invoke `slides` for in-app UI; it's for standalone HTML presentation decks.
