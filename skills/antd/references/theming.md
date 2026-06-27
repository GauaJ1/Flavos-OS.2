# antd — Theming & Token Reference

Referência completa do sistema de tokens e theming do Ant Design v5+.

---

## Arquitetura de tokens

```
SeedToken  (você define)
    ↓ algoritmo (defaultAlgorithm / darkAlgorithm / compactAlgorithm)
MapToken   (derivado automaticamente)
    ↓ mapeamento semântico
AliasToken (aplicado nos componentes)
```

Mudar um **Seed Token** → propaga por toda a cadeia.
Mudar um **MapToken** → afeta só aquele valor.
Mudar um **Alias Token** → afeta grupo semântico (ex: todos os links).

---

## Seed Tokens — o que você provavelmente vai customizar

```tsx
token: {
  // Cor
  colorPrimary: '#1677ff',    // Toda a hierarquia de cor primária
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',

  // Forma
  borderRadius: 6,            // Propaga para sm, md, lg, xl variants
  wireframe: false,           // true = estilo outlined/wireframe

  // Tamanho de fonte
  fontSize: 14,               // Base — propaga para toda escala

  // Espaçamento base
  sizeUnit: 4,                // Unidade mínima de espaçamento
  sizeStep: 4,                // Passo do escalonamento

  // Motion
  motion: true,               // false = desativa todas animações
  motionUnit: 0.1,            // Velocidade das animações (menor = mais rápido)
}
```

---

## Map Tokens — customizar derivados específicos

```tsx
token: {
  // Fundo
  colorBgLayout: '#f5f5f5',       // Fundo da página
  colorBgContainer: '#ffffff',    // Fundo de cards, formulários
  colorBgElevated: '#ffffff',     // Modais, dropdowns
  colorBgSpotlight: '#000000',    // Tooltip dark

  // Texto
  colorTextHeading: 'rgba(0,0,0,0.88)',
  colorText: 'rgba(0,0,0,0.88)',
  colorTextSecondary: 'rgba(0,0,0,0.45)',
  colorTextTertiary: 'rgba(0,0,0,0.25)',
  colorTextDisabled: 'rgba(0,0,0,0.25)',

  // Borda
  colorBorder: '#d9d9d9',
  colorBorderSecondary: '#f0f0f0',

  // Fill (fundos de elementos hover/selecionado)
  colorFill: 'rgba(0,0,0,0.15)',
  colorFillSecondary: 'rgba(0,0,0,0.06)',
  colorFillTertiary: 'rgba(0,0,0,0.04)',
  colorFillQuaternary: 'rgba(0,0,0,0.02)',
}
```

---

## Tema dark — customizações comuns

```tsx
import { theme } from 'antd';

<ConfigProvider
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#36d6ff',
      colorBgLayout: '#05070d',
      colorBgContainer: '#0d121d',
      colorBgElevated: '#121826',
      colorBorder: 'rgba(255,255,255,0.12)',
      colorBorderSecondary: 'rgba(255,255,255,0.07)',
    },
    components: {
      Card: {
        colorBgContainer: '#0d121d',
      },
      Table: {
        headerBg: '#121826',
        rowHoverBg: '#182033',
      },
      Menu: {
        darkItemBg: '#05070d',
        darkSubMenuItemBg: '#080b12',
      },
    },
  }}
>
```

---

## Tema compact — quando usar

Use `compactAlgorithm` em:
- Dashboards com muita informação
- Ferramentas técnicas / admin panels
- Usuários experientes que preferem densidade

```tsx
algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]
```

O compact reduz automaticamente paddings, heights e font sizes dos componentes.
Não precisa customizar manualmente cada componente.

---

## CSS Variables mode (v5.12+)

Permite trocar tema em runtime sem re-renderizar componentes:

```tsx
<ConfigProvider theme={{ cssVar: true, hashed: false }}>
```

Tokens ficam disponíveis como `var(--ant-color-primary)` no CSS.

---

## Consumir tokens fora do React

```tsx
import { theme } from 'antd';

// Estático (sem React)
const globalToken = theme.getDesignToken({
  token: { colorPrimary: '#1677ff' }
});

// No React
const { token } = theme.useToken();
```

---

## Temas aninhados (local overrides)

```tsx
// Tema diferente por seção da página
<ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
  <Header>...</Header>
  <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
    <Sidebar>...</Sidebar>
  </ConfigProvider>
</ConfigProvider>
```

---

## Performance

- `hashed: true` (default) → cada tema gera classNames únicos — múltiplos temas simultâneos
- `hashed: false` → classNames previsíveis — tema único, melhor para SSR/cache
- `zeroRuntime: true` (v6+) → gera CSS estático em build time

```tsx
// SSR + Next.js
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';

const cache = createCache();
// Envolver no StyleProvider durante SSR
// Extrair com extractStyle(cache) no getServerSideProps/generateStaticParams
```