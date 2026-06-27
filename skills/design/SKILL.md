---
name: flavos-web-console-design-system
description: >
  Design system skill for the Flavos Web Console — the visual interface of Flavos OS Core.
  Use this skill whenever working on any visual, styling, or UI task related to the Flavos Web Console,
  Flavos OS 2.0 dashboard, or any component inside dashboard/src/. Covers design direction, color tokens,
  typography, layout, component classes, page-level composition, and anti-patterns.
  Trigger on: "refine the web console", "improve the dashboard design", "update styles.css",
  "redesign the sidebar", "fix the UI", "make it look more professional", "aplicar design system",
  "melhorar visual do console", or any request to touch App.tsx, components/*, pages/*, or styles.css
  in the Flavos dashboard. This skill must take precedence over generic front-end instincts — the
  Flavos Web Console has a defined identity and must not drift toward generic admin panel aesthetics.
---

# Flavos Web Console — Design System

## What this skill does

Guides every visual decision in the Flavos Web Console so the interface looks like a
**premium, technical, cloud-native product** — not a generic admin panel or vibe-coded template.

Before writing any CSS, JSX, or component changes, read this skill fully.
For deep implementation detail, see the reference files:

- `references/tokens.md` — Full CSS custom property list and usage rules
- `references/components.md` — Class names, anatomy, and states for every component
- `references/pages.md` — Page-by-page layout specs (Dashboard, Services, Logs, Audit, Settings)

---

## Identity at a glance

```
Product name : Flavos OS 2.0 — Cloud Console
Design voice : Dark Enterprise OS · Cloud Infrastructure Console · Minimal Futuristic System UI
Must feel    : professional · premium · technical · trustworthy · modern · serious · minimal
Must NOT feel: generic · gamer · infantile · vibe-coded · SaaS template · random admin panel
```

Conceptual quality references (never copy layout directly):
- **Vercel Dashboard** — cleanliness, whitespace discipline
- **Linear** — information density without clutter
- **Raycast** — elegant density
- **Stripe Dashboard** — visual hierarchy
- **Cloudflare Dashboard** — operational clarity
- **Nothing OS** — minimalist brand identity

---

## Color tokens (canonical)

Always use CSS custom properties. Never hardcode hex values in components.

```css
/* Backgrounds — dark navy, not pure black */
--bg-deep:    #05070d;   /* deepest layer: log areas, code blocks */
--bg-main:    #080b12;   /* base page background */
--bg-elevated:#0d121d;   /* cards, panels */
--bg-soft:    #121826;   /* secondary panels, inputs */
--bg-hover:   #182033;   /* hover states */

/* Borders */
--border-subtle: rgba(255,255,255,0.07);  /* most borders */
--border-strong: rgba(255,255,255,0.12);  /* emphasized borders */

/* Text */
--text-main:  #f4f7fb;   /* primary content */
--text-soft:  #c8d0df;   /* secondary content */
--text-muted: #7f8aa3;   /* labels, metadata */
--text-faint: #4f5a70;   /* placeholders, disabled */

/* Accent — use sparingly */
--accent-primary:   #36d6ff;
--accent-secondary: #5cffc8;
--accent-glow:      rgba(54,214,255,0.16);

/* Semantic */
--success: #3dff9f;
--warning: #ffd166;
--danger:  #ff5f7e;
--info:    #64a8ff;
```

**Accent rules:**
- Active nav items, focus rings, key metric values only
- Never use accent color on every border or every card
- `--accent-glow` is for subtle background tints, not strong glows
- Strong semantic colors (danger, success) only for stateful badges, not decoration

---

## Typography

```css
/* UI text */
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
             BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Metrics, logs, paths, timestamps, IDs */
font-family: "JetBrains Mono", "SF Mono", "Roboto Mono",
             ui-monospace, monospace;
```

**Hierarchy rules:**
- Page titles: `font-size: 20–22px; font-weight: 600`
- Section headers: `font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted)`
- Metric values: `font-size: 28–36px; font-weight: 700; font-family: mono`
- Metric units: `font-size: 13–14px; font-weight: 400; color: var(--text-muted)` — always smaller than the number
- Labels: `font-size: 11–12px; text-transform: uppercase; letter-spacing: 0.07em`
- Log lines: `font-size: 12–13px; line-height: 1.6; font-family: mono`
- Body / descriptions: `font-size: 14px; color: var(--text-soft)`

---

## Layout system

```
┌─ sidebar (220–260px, fixed) ─┬─ main content ──────────────────────┐
│                               │  topbar (56–64px)                   │
│  logo + subtitle              │  ─────────────────────────────────  │
│  nav items                    │  page content                       │
│  ─────────────                │  max-width: 1200px; margin: 0 auto  │
│  version footer               │  padding: 24–32px                   │
└───────────────────────────────┴─────────────────────────────────────┘
```

### Sidebar spec
- Width: 220px default, expand to 260px if labels are long
- Background: `var(--bg-elevated)` — distinct from main
- Right border: `1px solid var(--border-subtle)`
- Logo: "Flavos" wordmark + subtitle "Cloud Console" or "Core Console" below it in `var(--text-muted)`
- Nav groups separated by subtle dividers (`border-top: 1px solid var(--border-subtle); margin: 8px 0`)
- Icons: 16px, `var(--text-muted)` inactive, `var(--accent-primary)` active
- Active nav item:
  - `background: rgba(54,214,255,0.08)`
  - `border-left: 2px solid var(--accent-primary)` (inset on the left edge)
  - Text: `var(--accent-primary)`
  - Icon: `var(--accent-primary)`
- Footer: version string in `var(--text-faint)`, `font-size: 11px`

### Topbar spec
- Height: 56–64px
- Background: `var(--bg-elevated)`
- Border bottom: `1px solid var(--border-subtle)`
- Left: breadcrumb or page title
- Right: hostname chip · agent status badge · environment tag · refresh btn · logout btn
- Status badge: small dot + label — green+running text for online, amber for degraded

### Content area
- Always `max-width: 1200px; margin: 0 auto`
- Padding: `24px` on mobile, `32px` on desktop
- Grid gap between cards: `16px`

---

## Components — quick reference

For full class-level detail see `references/components.md`.

### Panel / Card
```css
.panel {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;          /* 14–22px range; use 16px as default */
  padding: 20px 24px;
}
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panel-title  { font-size: 13px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.08em; color: var(--text-muted); }
```

Cards must **not** all look identical — vary padding, accent line presence, and title style
based on hierarchy. The hero/system-overview card can have a subtle gradient and accent line.

### Metric card
```
[icon or colored dot]  LABEL (uppercase small)
[big mono number]      [unit smaller]
[secondary text / delta]
[progress bar — thin, 4px height]
```

### Badges

```css
/* Base */
.badge { display: inline-flex; align-items: center; gap: 4px;
         padding: 2px 8px; border-radius: 20px;
         font-size: 11px; font-weight: 600; letter-spacing: 0.04em; }

.badge-success { background: rgba(61,255,159,0.12); color: var(--success); }
.badge-danger  { background: rgba(255,95,126,0.12); color: var(--danger);  }
.badge-warning { background: rgba(255,209,102,0.12); color: var(--warning);}
.badge-neutral { background: rgba(255,255,255,0.06); color: var(--text-muted); }
```

Add a 6px dot before the text for status badges (use `::before` with `border-radius: 50%`).

### Buttons

```css
.btn         { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-primary { background: var(--accent-primary); color: #05070d; }
.btn-secondary{background: rgba(92,255,200,0.12); color: var(--accent-secondary); border: 1px solid rgba(92,255,200,0.2); }
.btn-danger  { background: transparent; color: var(--danger); border: 1px solid rgba(255,95,126,0.3); }
.btn-ghost   { background: transparent; color: var(--text-muted); }
.btn-small   { padding: 4px 10px; font-size: 12px; }
```

Rules:
- `btn-primary` only for the single most important action per view
- `btn-danger` for destructive actions only; always trigger a confirm dialog
- Disabled state: `opacity: 0.4; cursor: not-allowed`
- Focus: `outline: 2px solid var(--accent-primary); outline-offset: 2px`

### Inputs & Selects

```css
input, select {
  background: var(--bg-soft);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-main);
  padding: 10px 14px;
  font-size: 14px;
}
input:focus, select:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
  outline: none;
}
```

### Table

```css
table { width: 100%; border-collapse: collapse; }
th    { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
        color: var(--text-muted); font-weight: 600; padding: 10px 16px;
        border-bottom: 1px solid var(--border-subtle); text-align: left; }
td    { padding: 12px 16px; font-size: 13px; color: var(--text-soft);
        border-bottom: 1px solid var(--border-subtle); }
tr:hover td { background: var(--bg-hover); }
```

Paths and IDs in table cells should use `font-family: monospace` and `var(--text-soft)`.
Long hex strings must be truncated with `max-width` + `text-overflow: ellipsis`.

### Progress bar (thin)

```css
.progress-bar { background: var(--bg-soft); border-radius: 4px; height: 4px; overflow: hidden; }
.progress-fill{ height: 100%; border-radius: 4px; background: var(--accent-primary);
                transition: width 0.4s ease; }
```

Use `var(--success)` fill for healthy metrics, `var(--warning)` for high usage, `var(--danger)` for critical.

### States

Every data-fetching view must implement all of these — they should never be an afterthought:

```
LoadingState  : spinner or skeleton, centered, no content flash
ErrorState    : icon + message + retry button; bg-soft panel, danger-tinted border
EmptyState    : icon + explanation + optional CTA; muted, not alarming
Unauthorized  : lock icon + "Session expired" + login button
Offline       : pulse dot + "Agent offline" message
```

---

## Page summaries

Full specs in `references/pages.md`. Key rules per page:

### Dashboard
1. **Hero panel** — larger card spanning full width or 2/3: product name, edition, hostname, uptime, agent status. Add a subtle `linear-gradient(135deg, var(--bg-elevated), var(--bg-soft))` + a 1px left accent line in `var(--accent-primary)`.
2. **Metric grid** — 3–4 columns on desktop. Each card: label, big mono number, unit, progress bar where meaningful.
3. **Services summary** — compact badge list or mini-table.
4. **Audit feed** — timeline with left color line per result, timestamp, path in mono, status badge.

### Services
- Card or row per service with: name, status badge, raw status, action buttons
- Running → `badge-success`; Stopped → `badge-danger`; Unknown → `badge-neutral`
- Actions: `Start (btn-secondary)` · `Restart (btn-ghost)` · `Stop (btn-danger, confirm required)`
- Never show disabled action buttons that clutter the row — hide them if not applicable

### Logs
- Service selector + line count selector in a toolbar row
- Log area: `background: var(--bg-deep); border-radius: 12px; padding: 16px 20px; font-family: mono; font-size: 12px; line-height: 1.6; white-space: pre-wrap; overflow-y: auto`
- Render logs as plain text only — never interpret HTML or markdown
- Scrollable container with max-height, not full-page scroll

### Audit
- Filter bar (success / failed / denied chips)
- Table: timestamp · path (mono) · action · result badge · failure reason
- Truncate long hex IDs to ~16 chars + `…` with `title` attribute for full value
- Row hover: `var(--bg-hover)`

### Settings / About
- Cards: Core · Security · Edition · Session
- This page is brand reinforcement — show product identity clearly
- Product name, version, edition, agent mode, auth mode, security notes

---

## Anti-patterns — never do these

| Don't | Do instead |
|---|---|
| Neon glow on every element | Reserve accent glow for active state only |
| Glassmorphism blur on cards | Subtle solid border + elevated background |
| All cards identical | Vary hierarchy with size, padding, accent lines |
| Buttons without hierarchy | One primary, contextual secondary/ghost/danger |
| Inline styles on components | CSS custom properties + utility classes |
| Gradient on every surface | Gradient only on hero card |
| Colored borders everywhere | Accent border only on active/focused/highlighted |
| `dangerouslySetInnerHTML` for logs | Always `textContent` / text node rendering |
| Token visible in UI or console | Always mask; never log |
| Misaligned or overflowing text | Use `min-width: 0; overflow: hidden; text-overflow: ellipsis` |
| Generic empty state (nothing rendered) | Always render a styled EmptyState component |
| Dark mode faking with `#000` black | Use navy-based backgrounds from the token set |

---

## Security rules (visual layer)

These are non-negotiable and must be preserved across every refactor:

- Token stored only in `sessionStorage`, never `localStorage` or cookies
- Token never printed to `console.log`, `console.debug`, or rendered in DOM
- Long hex strings in audit events masked to `${value.slice(0,8)}…${value.slice(-4)}`
- Log content rendered as plain text (`textContent`) — never `innerHTML`
- Confirm dialog required before any destructive action (stop service, revoke session)

---

## Workflow for applying this skill

1. Read this SKILL.md fully before touching any file
2. Read `references/tokens.md` to verify current token set matches canonical list
3. Read `references/components.md` for the component you're about to change
4. Read `references/pages.md` for the page you're about to change
5. Apply changes — CSS first, then JSX structure only if needed for markup correctness
6. Never alter API logic, fetch calls, auth state, or agent communication
7. After changes: `npm run build` — zero TypeScript errors required
8. Validate visually by checking each page: Dashboard, Services, Logs, Audit, Settings