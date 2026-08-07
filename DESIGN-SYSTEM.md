# HunarHub Design System

Reference for the shared visual language. Everything lives in `src/components/ui/`, with tokens in `src/index.css`.

## Principles

1. **Monochrome first, one accent.** Black/white/gray carries the editorial feel; terracotta (`accent`) marks actions and highlights — it echoes clay and pottery.
2. **Tokens over hardcoded values.** Use semantic classes so dark mode and future re-themes are a one-line change.
3. **Reuse before rebuild.** If a pattern exists in `ui/`, extend it rather than duplicating markup.
4. **Accessible by default.** Real semantics, keyboard support, visible focus, honoured reduced-motion.

## Tokens

Defined in `@theme` and as CSS variables, so `.dark` on `<html>` re-themes everything.

| Class | Meaning | Light | Dark |
|---|---|---|---|
| `bg-surface` | Page background | `#fcfcfc` | `#0d0d0f` |
| `bg-surface-2` | Cards, panels | `#ffffff` | `#16171a` |
| `text-fg` | Primary text | `#111111` | `#f5f5f5` |
| `text-muted` | Secondary text | `#6b7280` | `#a1a1aa` |
| `border-line` | Borders/dividers | `#e5e7eb` | `#2a2b2f` |
| `text-accent` / `bg-accent` | Accent (terracotta) | `#c2410c` | same |

Typography: **Inter** (sans) for UI, **JetBrains Mono** for labels/eyebrows (10–11px, uppercase, wide tracking). Spacing follows an 8px base. `--ease-brand` = `cubic-bezier(0.16, 1, 0.3, 1)` for signature motion.

## Primitives

| Component | Use it for | Notes |
|---|---|---|
| `Button` / `buttonStyles` | All actions | Variants: `primary`, `secondary`, `ghost`, `onDark`. Sizes `sm\|md\|lg`. `loading` shows a spinner + `aria-busy`. Use `buttonStyles()` on `<Link>` so links match buttons without duplication. |
| `Card` / `CardHeader` | Panels, list containers | Token-based surface + border. |
| `Badge` | Status/labels | Tones: `neutral`, `accent`, `success`, `warning`, `dark`. |
| `StatusBadge` / `OrderTimeline` | Order state | Human-readable labels; timeline degrades sensibly for declined orders. |
| `Avatar` (`Monogram`) | People | Image when available, else initials. `Monogram` delegates to `Avatar`. |
| `Tabs` / `TabPanel` | Tabbed sections | Full ARIA + roving focus (←/→/Home/End). |
| `Field`, `TextInput`, `SelectInput` | Forms | Labels wired via `htmlFor`, inline error text. |
| `States`: `Skeleton`, `CardGridSkeleton`, `EmptyState`, `ErrorState` | Async UI | Every data view should cover loading / empty / error. |
| `Toast` (`useToast`) | Feedback | `toast(message, 'success' \| 'error' \| 'info')`. |
| `Container` | Page width | Max 1200px with consistent gutters. |
| `SectionHeading` | Section intros | Eyebrow + title + subtitle, left or centered. |
| `ThemeToggle` | Dark mode | Backed by `ThemeContext` (persists + respects OS preference). |

## Conventions

- **Colors:** prefer `bg-surface-2` / `text-muted` / `border-line` over raw grays in new code. Existing screens still use literal grays; migrate opportunistically, never in a risky bulk edit.
- **Async views:** loading → skeleton, empty → `EmptyState` with a next action, failure → `ErrorState` with retry.
- **Icons:** `lucide-react`, 13–22px, `strokeWidth` 1.4–2. Icon-only controls **must** have `aria-label`.
- **Motion:** `motion/react`, 0.3–0.7s, `--ease-brand`. Entrances use `whileInView` + `once: true`. Reduced motion is honoured globally in CSS.
- **Focus:** never remove outlines — the global `:focus-visible` style provides an accent ring.

## Dark mode

`ThemeProvider` sets `.dark` on `<html>`, persists to localStorage, and defaults to the OS preference. Components using semantic tokens adapt automatically; the deliberately dark sections (Craft Spotlight, Impact Stats) stay dark in both themes by design.

## Adding a component

1. Check whether an existing primitive can be extended.
2. Put shared pieces in `src/components/ui/`, feature-specific ones next to their feature.
3. Use tokens, keep props minimal and typed, support `className` for composition.
4. Cover keyboard + screen-reader behaviour, and add a test if it has interactive logic.
