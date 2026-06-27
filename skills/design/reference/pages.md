# Flavos Web Console — Page Specs

Per-page layout, composition, and content rules.

---

## Dashboard

The Dashboard is the most important screen. It must feel like a real infrastructure console on first load.

### Structure

```
┌── System Hero (full width) ──────────────────────────────────┐
│  Flavos OS 2.0 · Cloud Edition · hostname · uptime · status  │
└──────────────────────────────────────────────────────────────┘

┌── CPU ──┐ ┌── Memory ─┐ ┌── Load ────┐ ┌── Uptime ─┐
│         │ │           │ │            │ │           │
└─────────┘ └───────────┘ └────────────┘ └───────────┘

┌── Services Summary ──────┐ ┌── Recent Audit Events ──────────┐
│  compact running list    │ │  timeline with left color lines │
└──────────────────────────┘ └─────────────────────────────────┘
```

### Hero panel rules

- Use `.system-card` class (see `references/components.md`)
- Show: product name, edition badge, hostname (mono), kernel/distro, agent status, uptime
- Edition badge uses `--accent-secondary`, not `--accent-primary`
- Uptime value in mono
- Agent status uses `.status-online` / `.status-offline` component

### Metric grid rules

- CSS grid: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- Gap: 16px
- Each card: label → big mono number → unit → secondary text → progress bar
- CPU: show percentage + bar
- Memory: show used % + "X MB / Y GB" below + bar
- Load avg: show 3 values (1m / 5m / 15m) in a small mono grid, no bar needed
- Uptime: no bar, just formatted value

### Services Summary (on Dashboard)

- Compact, not full services page
- Show running count vs total
- List max 5–6 services with just name + badge
- "View all →" link at bottom

### Audit Feed (on Dashboard)

- Max 8–10 most recent events
- Each row: timestamp + path + result badge + left color line
- Do not paginate on Dashboard — "View all →" link at bottom
- Success: green left line; failed/denied: red/amber; neutral: subtle

---

## Services Page

Full services management view.

### Layout

- `.panel` wrapping a `.table-container`
- Toolbar above table: page title + refresh button

### Table columns

| # | Column | Width | Notes |
|---|---|---|---|
| 1 | Service | auto | font-weight 500; `var(--text-main)` |
| 2 | Status | 120px | `.badge` with color |
| 3 | State | 160px | raw string; `.td-mono` |
| 4 | Actions | 200px | button group; right-align |

### Badge mapping

| Service state | Badge class | Label |
|---|---|---|
| active/running | `.badge-success` | Running |
| inactive/stopped | `.badge-danger` | Stopped |
| failed | `.badge-danger` | Failed |
| reloading | `.badge-warning` | Reloading |
| activating | `.badge-info` | Starting |
| unknown | `.badge-neutral` | Unknown |

### Action button logic

```
if (running)  → show [Restart .btn-ghost.btn-small] [Stop .btn-danger.btn-small]
if (stopped)  → show [Start .btn-secondary.btn-small]
if (unknown)  → show no actions (or gray info badge)
```

Never render a disabled Stop button when service is already stopped — omit it entirely.

### Stop confirmation dialog

Required content:
- Icon: warning/danger symbol
- Title: "Stop [service name]?"
- Body: "This will stop the service immediately. Any active connections will be interrupted."
- Actions: [Cancel .btn-ghost] [Stop Service .btn-danger]

---

## Logs Page

Technical log viewer with minimal chrome around the log area itself.

### Layout

```
┌── Toolbar ─────────────────────────────────────────────────┐
│  [service selector]  [line count selector]  [Refresh btn]  │
└────────────────────────────────────────────────────────────┘
┌── Log Panel (.panel) ──────────────────────────────────────┐
│  .panel-header: "Logs — {serviceName}"  [copy btn]         │
│                                                             │
│  .log-area                                                  │
│  [log output as plain text, monospace, dark bg]             │
└────────────────────────────────────────────────────────────┘
```

### Selectors

- Service selector: `.select` — lists available services
- Line count: `.select` with options [50, 100, 200, 500]
- Both in a flex row with `gap: 12px`

### Log area requirements

- Background: `var(--bg-deep)` — noticeably darker than surrounding page
- Font: `var(--font-mono)`, 12–13px, `line-height: 1.65`
- Content: **always `textContent = logData`** — never `innerHTML`
- `white-space: pre-wrap` — preserve line breaks
- `overflow-y: auto; max-height: 60vh` — scrollable container
- Empty state: "Select a service to view logs" in center

### No-log state

When a service has no logs: use `.state-container` with an icon and message.
Do not show an empty dark box — render an EmptyState.

---

## Audit Page

Security audit trail — must look trustworthy and well-organized.

### Layout

```
┌── Filter Bar ────────────────────────────────────────────────┐
│  [All] [Success] [Failed] [Denied]  · count badge per filter │
└──────────────────────────────────────────────────────────────┘
┌── Audit Table (.panel) ──────────────────────────────────────┐
│  Timestamp │ Method │ Path │ Result │ User │ Failure Reason  │
│  ─────────────────────────────────────────────────────────── │
│  rows with hover + left border color by result               │
└──────────────────────────────────────────────────────────────┘
```

### Filter chips

```css
.filter-chip {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.filter-chip.active {
  background: var(--bg-soft);
  color: var(--text-main);
  border-color: var(--border-strong);
}
```

### Table columns

| Column | Notes |
|---|---|
| Timestamp | `font-family: mono; font-size: 11px; color: var(--text-faint)` |
| Method | `GET / POST / DELETE` — mono, all caps |
| Path | `.td-mono` — truncate with ellipsis at 240px |
| Result | Badge: success/failed/denied |
| Failure Reason | `var(--text-muted); font-size: 12px` — truncate long strings |

### Hex string masking

Any value matching `/^[0-9a-f]{16,}$/i` must be masked:
```js
const maskHex = (v) =>
  /^[0-9a-f]{16,}$/i.test(v)
    ? `${v.slice(0, 8)}…${v.slice(-4)}`
    : v;
```

Apply to: path parameters, user IDs, token fragments in failure reasons.

### Row coloring

```css
/* Applied to <tr> not <td> */
tr.audit-success td:first-child { border-left: 3px solid var(--success); }
tr.audit-failed  td:first-child { border-left: 3px solid var(--danger);  }
tr.audit-denied  td:first-child { border-left: 3px solid var(--warning); }
```

---

## Settings / About Page

Brand reinforcement page. Should feel like polished product documentation.

### Layout

```
┌── Page title: "About Flavos OS" ──────────────────────────────┐
│  Subtitle: "Cloud Console · Web Console MVP"                  │
└────────────────────────────────────────────────────────────────┘

┌── Core ────────────┐ ┌── Security ──────────────────────────┐
│  OS: Void Linux    │ │  Auth mode: Token                    │
│  Kernel: x.x.x    │ │  Session: sessionStorage             │
│  Edition: Cloud    │ │  Token masked: yes                   │
└────────────────────┘ └──────────────────────────────────────┘

┌── Edition ─────────────────────┐ ┌── Session ─────────────┐
│  Flavos OS 2.0 · Cloud Edition │ │  Agent: online         │
│  Flavos OS Core vX.X           │ │  Connected: hostname   │
│  Web Console MVP               │ │  [Logout btn]          │
└────────────────────────────────┘ └────────────────────────┘
```

### Card content rules

- Each card uses `.panel` base
- All version strings in `.td-mono` or `font-family: mono`
- Don't show token value — show "Active session" only
- "Logout" button: `.btn.btn-ghost` — destructive but not dangerous styling (it's expected)

### Flavos branding on this page

This page is where the product identity is most explicit. Include:
- Full product name: "Flavos OS 2.0"
- Edition: "Cloud Edition"
- Console: "Web Console"
- Company: "Flavos Company"
- A subtle horizontal rule or `.section-divider` between groups

---

## Login Page

Minimal, premium, full-screen centered.

### Layout

```
[bg-main full screen]
  ┌── .login-card ──────────────────────┐
  │                                     │
  │  [Flavos logo + wordmark]           │
  │  [subtitle: "Cloud Console"]        │
  │                                     │
  │  [label: Agent URL]                 │
  │  [input: http://...]                │
  │                                     │
  │  [label: Access Token]              │
  │  [input type="password": ...]       │
  │                                     │
  │  [btn-primary: Connect]             │
  │                                     │
  │  [error message if any]             │
  └─────────────────────────────────────┘
```

### Login card

```css
.login-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-panel);
}
```

### Rules

- Token field: `type="password"` — never `type="text"`
- On submit: validate not empty, then attempt connection
- Error state: red message below the button, not an alert popup
- Never log the token to console on connect or on error
- "Connect" button: full-width `.btn.btn-primary`

---

## Responsive breakpoints

```css
/* Desktop: sidebar fixed */
@media (min-width: 1024px) {
  .layout { display: grid; grid-template-columns: 240px 1fr; }
  .sidebar { position: sticky; top: 0; height: 100vh; }
}

/* Tablet: sidebar narrower */
@media (max-width: 1023px) and (min-width: 640px) {
  .layout { grid-template-columns: 200px 1fr; }
}

/* Mobile: sidebar hidden, top nav */
@media (max-width: 639px) {
  .layout { display: block; }
  .sidebar { display: none; }
  .mobile-nav { display: flex; }
}
```

Mobile state: sidebar collapses into a simple top bar with a hamburger or horizontal icon row.
MVP mobile doesn't need a full drawer — a simple top tab nav for the main pages is sufficient.
Priority: don't make it inaccessible, but don't over-engineer mobile for MVP.