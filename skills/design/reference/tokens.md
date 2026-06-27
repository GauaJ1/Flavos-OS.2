# Flavos Web Console — Design Tokens

Full reference for all CSS custom properties used in the Flavos Web Console.

---

## Full token list

Paste this block into `styles.css` inside `:root {}` and do not duplicate.

```css
:root {
  /* ── Backgrounds ─────────────────────────────────── */
  --bg-deep:      #05070d;   /* Deepest: log panels, code areas */
  --bg-main:      #080b12;   /* Base page background */
  --bg-elevated:  #0d121d;   /* Cards, panels, sidebar */
  --bg-soft:      #121826;   /* Secondary panels, inputs, toolbar */
  --bg-hover:     #182033;   /* Row/item hover state */

  /* ── Borders ─────────────────────────────────────── */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.12);

  /* ── Text ────────────────────────────────────────── */
  --text-main:  #f4f7fb;  /* Primary content */
  --text-soft:  #c8d0df;  /* Secondary content, descriptions */
  --text-muted: #7f8aa3;  /* Labels, metadata, section headers */
  --text-faint: #4f5a70;  /* Placeholders, disabled, version info */

  /* ── Accent — use sparingly ─────────────────────── */
  --accent-primary:   #36d6ff;
  --accent-secondary: #5cffc8;
  --accent-glow:      rgba(54, 214, 255, 0.16);

  /* ── Semantic states ─────────────────────────────── */
  --success:  #3dff9f;
  --warning:  #ffd166;
  --danger:   #ff5f7e;
  --info:     #64a8ff;

  /* ── Semantic background tints ──────────────────── */
  --success-tint:  rgba(61, 255, 159, 0.12);
  --warning-tint:  rgba(255, 209, 102, 0.12);
  --danger-tint:   rgba(255, 95, 126, 0.12);
  --info-tint:     rgba(100, 168, 255, 0.12);

  /* ── Typography ──────────────────────────────────── */
  --font-ui:   Inter, ui-sans-serif, system-ui, -apple-system,
               BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", "Roboto Mono",
               ui-monospace, monospace;

  /* ── Spacing scale ───────────────────────────────── */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;

  /* ── Radius ──────────────────────────────────────── */
  --radius-sm:  8px;   /* Buttons, inputs */
  --radius-md:  12px;  /* Smaller cards */
  --radius-lg:  16px;  /* Standard card/panel */
  --radius-xl:  20px;  /* Hero panel, large modals */

  /* ── Shadows ─────────────────────────────────────── */
  --shadow-card:  0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-panel: 0 4px 16px rgba(0, 0, 0, 0.3);

  /* ── Transitions ─────────────────────────────────── */
  --transition-fast:   0.12s ease;
  --transition-normal: 0.2s ease;
  --transition-slow:   0.4s ease;
}
```

---

## Token usage guidance

### When to use each background

| Token | Use for |
|---|---|
| `--bg-deep` | Log output areas, code blocks, terminal panels |
| `--bg-main` | Root `<body>` / `#root` background |
| `--bg-elevated` | Cards, panels, sidebar, topbar |
| `--bg-soft` | Input fields, secondary panels, toolbars, dropdowns |
| `--bg-hover` | Row hover, nav item hover, button hover overlay |

### Text contrast rules

- Never use `--text-faint` for interactive or meaningful text — only version numbers, placeholders
- Section headers (the small uppercase labels above panels) always use `--text-muted`
- Primary data values (metrics, hostnames, paths) always use `--text-main`
- Descriptions and secondary metadata use `--text-soft`

### Accent discipline

The accent palette is for **identity and focus**, not decoration.

Allowed uses:
- Active sidebar nav item text + icon
- Focus ring on inputs/buttons (`box-shadow: 0 0 0 3px var(--accent-glow)`)
- Active/selected state highlight
- Key hero metric callout (one value per dashboard)
- Accent line on hero panel

Forbidden uses:
- All card borders
- Every badge
- Background fills for regular cards
- Section dividers

### Semantic color rules

Use semantic tokens for states only:
- `--success` / `--success-tint`: Running, OK, online, success audit event
- `--warning` / `--warning-tint`: Degraded, high usage, retrying
- `--danger` / `--danger-tint`: Stopped, failed, denied, critical usage
- `--info` / `--info-tint`: Informational notice, neutral audit event

---

## Base CSS reset (add before component styles)

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-ui);
  background: var(--bg-main);
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a { color: var(--accent-primary); text-decoration: none; }
a:hover { text-decoration: underline; }

code, pre, .mono { font-family: var(--font-mono); }

::selection {
  background: rgba(54, 214, 255, 0.2);
  color: var(--text-main);
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }
```