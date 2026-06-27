# Flavos Web Console — Component Reference

Full anatomy, class names, and state specs for every reusable component.

---

## Table of contents

1. [Panel / Card](#panel--card)
2. [Metric Card](#metric-card)
3. [System Hero Card](#system-hero-card)
4. [Badge](#badge)
5. [Button](#button)
6. [Input & Select](#input--select)
7. [Table](#table)
8. [Progress Bar](#progress-bar)
9. [Section Header](#section-header)
10. [Audit Row / Timeline](#audit-row--timeline)
11. [Service Card / Row](#service-card--row)
12. [Log Viewer](#log-viewer)
13. [Confirm Dialog](#confirm-dialog)
14. [States: Loading / Error / Empty](#states-loading--error--empty)
15. [Sidebar Nav Item](#sidebar-nav-item)
16. [Status Dot Badge](#status-dot-badge)

---

## Panel / Card

**Class:** `.panel`

```css
.panel {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  box-shadow: var(--shadow-card);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

**Do not** make every card look the same. The hero panel gets a larger radius, gradient, and accent line.
Regular metric cards are compact. Audit feed panels are narrow-padding list containers.

---

## Metric Card

**Class:** `.metric-card`

```css
.metric-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}

.metric-value {
  font-family: var(--font-mono);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.metric-unit {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
}

.metric-secondary {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
```

Follow with a `.progress-bar` when showing resource usage (memory, CPU, disk).

**JSX structure:**
```jsx
<div className="metric-card">
  <div className="metric-label">Memory Used</div>
  <div className="metric-value">
    11<span className="metric-unit">%</span>
  </div>
  <div className="metric-secondary">216.9 MB / 1.92 GB</div>
  <ProgressBar value={11} />
</div>
```

---

## System Hero Card

**Class:** `.system-card`

The single most prominent element on the Dashboard.

```css
.system-card {
  background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-soft) 100%);
  border: 1px solid var(--border-subtle);
  border-left: 2px solid var(--accent-primary);
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  box-shadow: var(--shadow-panel);
}

.system-card-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.system-card-edition {
  font-size: 13px;
  color: var(--accent-secondary);
  font-weight: 500;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.system-card-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.system-card-meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.system-card-meta-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-faint);
}

.system-card-meta-value {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--text-soft);
}
```

---

## Badge

**Class:** `.badge` + modifier

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.badge::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.badge-success { background: var(--success-tint); color: var(--success); }
.badge-danger  { background: var(--danger-tint);  color: var(--danger);  }
.badge-warning { background: var(--warning-tint); color: var(--warning); }
.badge-info    { background: var(--info-tint);    color: var(--info);    }
.badge-neutral { background: rgba(255,255,255,0.06); color: var(--text-muted); }
```

For badges that are purely labels without a status dot, add `.badge-no-dot` and remove the `::before`.

---

## Button

**Class:** `.btn` + modifier

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-ui);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  white-space: nowrap;
  line-height: 1;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Primary — one per view */
.btn-primary {
  background: var(--accent-primary);
  color: #05070d;
  border-color: var(--accent-primary);
}
.btn-primary:hover { filter: brightness(1.1); }

/* Secondary / constructive */
.btn-secondary {
  background: rgba(92, 255, 200, 0.1);
  color: var(--accent-secondary);
  border-color: rgba(92, 255, 200, 0.2);
}
.btn-secondary:hover { background: rgba(92, 255, 200, 0.16); }

/* Danger — always confirm before action */
.btn-danger {
  background: transparent;
  color: var(--danger);
  border-color: rgba(255, 95, 126, 0.3);
}
.btn-danger:hover {
  background: rgba(255, 95, 126, 0.08);
  border-color: rgba(255, 95, 126, 0.5);
}

/* Ghost — for secondary nav actions, refresh */
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border-color: transparent;
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-soft);
}

/* Small variant */
.btn-small {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 6px;
}
```

---

## Input & Select

```css
.input, .select {
  width: 100%;
  background: var(--bg-soft);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-family: var(--font-ui);
  font-size: 14px;
  padding: 10px 14px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
}

.input::placeholder { color: var(--text-faint); }

.input:focus, .select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.input-helper {
  font-size: 12px;
  color: var(--text-faint);
  margin-top: 4px;
}

.input-error { border-color: var(--danger) !important; }
.input-error-msg {
  font-size: 12px;
  color: var(--danger);
  margin-top: 4px;
}

/* Wrapper for label + input + helper */
.field {
  display: flex;
  flex-direction: column;
  gap: 0;
}
```

---

## Table

```css
.table-container {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-elevated);
}

thead tr {
  border-bottom: 1px solid var(--border-subtle);
}

th {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 11px 16px;
  text-align: left;
  background: var(--bg-elevated);
  white-space: nowrap;
}

td {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text-soft);
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
}

tr:last-child td { border-bottom: none; }

tbody tr:hover td { background: var(--bg-hover); }

/* Mono cell for paths, IDs, timestamps */
.td-mono {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-soft);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## Progress Bar

```css
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-soft);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width var(--transition-slow);
  background: var(--accent-primary);
}

/* Color variants based on value */
.progress-fill.progress-ok      { background: var(--accent-primary); }
.progress-fill.progress-warning { background: var(--warning); }
.progress-fill.progress-danger  { background: var(--danger); }
```

Apply the correct color class based on threshold:
- < 70% → `progress-ok`
- 70–89% → `progress-warning`
- ≥ 90% → `progress-danger`

---

## Section Header

```css
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.section-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 24px 0;
}
```

---

## Audit Row / Timeline

Each audit row has a left color indicator line, not a border.

```css
.audit-list { display: flex; flex-direction: column; gap: 2px; }

.audit-row {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 11px 16px 11px 20px;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: background var(--transition-fast);
}

.audit-row:hover { background: var(--bg-hover); }

.audit-row.audit-success { border-left-color: var(--success); }
.audit-row.audit-failed  { border-left-color: var(--danger);  }
.audit-row.audit-denied  { border-left-color: var(--warning); }
.audit-row.audit-neutral { border-left-color: var(--border-subtle); }

.audit-timestamp {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-faint);
  white-space: nowrap;
}

.audit-path {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## Service Card / Row

Services can be displayed as table rows or compact cards.

**As table row** (preferred for > 5 services):
```
[status badge] [name] [raw status mono] [action buttons]
```

**Action button rules:**
- Start: `.btn.btn-secondary.btn-small` — only show if service is stopped
- Restart: `.btn.btn-ghost.btn-small` — only show if service is running
- Stop: `.btn.btn-danger.btn-small` — only show if service is running; confirm required
- Hide buttons that don't apply — don't disable them and clutter the row

---

## Log Viewer

```css
.log-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.log-area {
  background: var(--bg-deep);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.65;
  color: var(--text-soft);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  max-height: 60vh;
  min-height: 200px;
}

/* Render ONLY as text — never innerHTML */
/* Use: logElement.textContent = logData */
```

---

## Confirm Dialog

Required before any destructive action (stop service, logout, delete).

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 7, 13, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-panel);
}

.dialog-icon {
  color: var(--danger);
  font-size: 24px;
  margin-bottom: 12px;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.dialog-body {
  font-size: 13px;
  color: var(--text-soft);
  line-height: 1.6;
  margin-bottom: 24px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

---

## States: Loading / Error / Empty

```css
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
  min-height: 200px;
}

.state-icon {
  font-size: 28px;
  opacity: 0.5;
}

.state-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-soft);
}

.state-description {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 320px;
  line-height: 1.5;
}

/* Error state gets a tinted panel */
.state-error {
  background: var(--danger-tint);
  border: 1px solid rgba(255, 95, 126, 0.2);
  border-radius: var(--radius-lg);
}

/* Loading spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
```

---

## Sidebar Nav Item

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  margin: 1px 0;
  border-left: 2px solid transparent;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-soft);
}

.nav-item.active {
  background: rgba(54, 214, 255, 0.08);
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
  font-weight: 600;
}

.nav-item.active .nav-icon { color: var(--accent-primary); }

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--text-faint);
  transition: color var(--transition-fast);
}
```

---

## Status Dot Badge

Used in topbar and hero card for agent status.

```css
.status-online, .status-offline, .status-degraded {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-online {
  background: var(--success-tint);
  color: var(--success);
}

.status-offline {
  background: var(--danger-tint);
  color: var(--danger);
}

.status-degraded {
  background: var(--warning-tint);
  color: var(--warning);
}

/* Pulsing dot for online only */
.status-online::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  animation: pulse-dot 2s ease infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
```