# Flavos Web Console — Design System

> Version 2.0 · Dark Enterprise OS · Ant Design integration

---

## Vision

O Flavos Web Console é uma interface de administração dark-first para o Flavos OS Core. O design deve comunicar:

- **Autoridade técnica** — interface de controle de servidor real, não um dashboard genérico
- **Precisão** — dados monitorados em tempo real com alta legibilidade
- **Identidade própria** — identidade Flavos, não aparência de template

---

## Color Palette

### Backgrounds (camadas)

| Token | Valor | Uso |
|---|---|---|
| `--bg-deep` | `#05070d` | Console de logs, fundo mais escuro |
| `--bg-main` | `#080b12` | Background principal da página |
| `--bg-elevated` | `#0d121d` | Sidebar, header, cards primários |
| `--bg-card` | `#0e1420` | Cards Ant Design |
| `--bg-soft` | `#121826` | Inputs, badges neutros |
| `--bg-hover` | `#182033` | Estado hover de rows e nav items |

### Borders

| Token | Valor |
|---|---|
| `--border` | `rgba(255,255,255,0.09)` |
| `--border-subtle` | `rgba(255,255,255,0.07)` |
| `--border-strong` | `rgba(255,255,255,0.12)` |

### Text

| Token | Uso |
|---|---|
| `--text-primary / --text-main` | Conteúdo principal |
| `--text-secondary / --text-soft` | Conteúdo secundário |
| `--text-muted` | Labels, captions |
| `--text-faint` | Placeholder, versão, hints |

### Accent

| Token | Valor | Uso |
|---|---|---|
| `--accent / --accent-primary` | `#36d6ff` | Azul ciano Flavos — use com moderação |
| `--accent-secondary` | `#5cffc8` | Verde menta — edition badges, subtítulos |
| `--accent-glow` | `rgba(54,214,255,0.16)` | Box-shadow de foco |

### Semantic

| Token | Valor | Contexto |
|---|---|---|
| `--success` | `#3dff9f` | Online, running, success |
| `--warning` | `#ffd166` | Degraded, >70% usage |
| `--danger` | `#ff5f7e` | Error, stopped, >90% usage |
| `--info` | `#64a8ff` | Informational |

---

## Typography

### Font Stack

```css
/* UI (padrão) */
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Monospace — métricas, logs, IDs, paths */
font-family: "JetBrains Mono", "SF Mono", "Roboto Mono", ui-monospace, monospace;
```

### Regras de uso

- **Dados numéricos** (CPU %, RAM, uptime, contadores): sempre monospace via `--font-mono`
- **Paths, endpoints, comandos**: sempre monospace
- **IDs hexadecimais longos**: truncar com `maskSensitiveStrings()` + Tooltip com valor completo
- **Labels de seção**: `11px`, uppercase, `letter-spacing: 0.06–0.08em`, `--text-muted`
- **Page titles**: `20px`, weight 600, `--text-main`

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)        │  HEADER (60px)                │
│                         │─────────────────────────────  │
│  Brand logo + name      │  PAGE CONTENT (scroll)        │
│  Nav items              │                               │
│                         │  max-width: 1100px            │
│  [footer version]       │                               │
└─────────────────────────┴───────────────────────────────┘
```

- Sidebar: `position: sticky`, `height: 100vh`
- Content: `overflow-y: auto`, padding `32px`
- Pages: `max-width: 1100px`

---

## Ant Design Theme Configuration

```tsx
// main.tsx
<ConfigProvider
  theme={{
    algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    token: {
      colorPrimary: '#36d6ff',
      colorBgBase: '#080b12',
      colorBgContainer: '#0d121d',
      colorBgElevated: '#111827',
      colorBorder: 'rgba(255,255,255,0.09)',
      colorBorderSecondary: 'rgba(255,255,255,0.07)',
      colorText: '#f4f7fb',
      colorTextSecondary: '#c8d0df',
      colorTextTertiary: '#7f8aa3',
      colorSuccess: '#3dff9f',
      colorWarning: '#ffd166',
      colorError: '#ff5f7e',
      colorInfo: '#64a8ff',
      fontFamily: 'Inter, ui-sans-serif, ...',
      borderRadius: 8,
      borderRadiusLG: 12,
    }
  }}
>
```

---

## Component Patterns

### Cards
- Usar `<Card>` do Ant Design com `background: var(--bg-card)` e `border: 1px solid var(--border)`
- Para cards de destaque: `border-left: 2px solid var(--accent)`

### Tabela de dados (Logs, Audit)
- Usar `<Table>` com `size="small"` e `scroll={{ x: 'max-content' }}`
- Colunas de timestamp e paths: `font-family: var(--font-mono)`, `font-size: 12px`
- Row highlight via `rowClassName` prop

### Status indicators
- Usar `<Badge status="success|error|processing|warning" />`
- Nunca usar strings de cor puras — mapear para os tokens semânticos

### Métricas numéricas
- Usar `<Statistic>` com `valueStyle` colorido baseado em threshold:
  - `< 70%` → `--success`
  - `70–90%` → `--warning`
  - `> 90%` → `--danger`

### Notificações / Toasts
- Usar exclusivamente via `App.useApp()` da Ant Design para respeitar o contexto
- **Não usar** `message.success()` ou `notification.open()` como singletons globais

### Ações destrutivas
- Envolver sempre em `<Popconfirm>` com `okButtonProps={{ danger: true }}`
- Nginx stop: permanentemente desabilitado + `<Tooltip>` explicativo

---

## Security Design Rules

- IDs hexadecimais longos → `${value.slice(0,8)}…${value.slice(-4)}` com Tooltip
- Todos os strings exibidos passam por `maskSensitiveStrings()`
- Token nunca exibido na UI
- Nginx stop bloqueado na UI para prevenir auto-DOS

---

## File Map

```
dashboard/src/
├── styles.css          ← Design tokens + sidebar + login + AntD overrides
├── main.tsx            ← antd/dist/reset.css + ConfigProvider + App wrapper
├── App.tsx             ← Layout principal
├── components/
│   ├── Sidebar.tsx     ← Nav com identidade Flavos
│   ├── Header.tsx      ← Topbar com host status
│   └── LoadingState.tsx← Spin + Result + Empty (Ant Design)
└── pages/
    ├── LoginPage.tsx   ← Form Ant Design
    ├── DashboardPage.tsx ← Card + Statistic + Progress + List
    ├── ServicesPage.tsx  ← Card + Popconfirm + Nginx lock
    ├── LogsPage.tsx      ← Select + Card + pre block
    ├── AuditPage.tsx     ← Table + Radio.Group + Tag + MaskedId
    └── SettingsPage.tsx  ← Descriptions + Alert + Popconfirm
```
