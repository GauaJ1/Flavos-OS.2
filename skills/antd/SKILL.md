---
name: antd-beautiful-design
description: >
  Use this skill whenever building, refining, or reviewing UI with Ant Design (antd) — especially
  when the goal is visual quality, design consistency, or a polished result. Triggers on: "fazer
  tela bonita com antd", "melhorar visual com ant design", "criar interface com antd", "quero uma
  UI elegante com antd", "dashboard com ant design", "formulário bonito com antd", or any task
  involving antd components that needs to look good beyond just working.
  Also triggers when the user asks to avoid "vibe coding" in an antd project, wants a professional
  or premium feel, or asks to apply best practices to antd code. This skill goes beyond the official
  antd CLI skill — it focuses on design judgment, composition, theming, and visual excellence.
  Always read this skill before writing any antd UI code.
---

# Ant Design — Beautiful UI Skill

Este skill cobre como extrair o **máximo visual possível** do Ant Design — não só fazer funcionar,
mas fazer parecer **polido, consistente e profissional**.

Antes de escrever qualquer código antd, leia este SKILL.md completamente.
Para referências de tokens e composição avançada, veja os arquivos em `references/`.

---

## Setup obrigatório antes de escrever código

O antd tem CLI oficial com todo o conhecimento de componentes offline:

```bash
# Instalar uma vez
npm install -g @ant-design/cli

# Sempre rodar antes de usar um componente
antd info Button --format json      # props, tipos, defaults
antd demo Button basic --format json # demo funcional
antd token Button --format json     # design tokens do componente
antd semantic Table --format json   # classNames/styles para customização
```

**Regra de ouro: nunca adivinhar props do antd. Sempre rodar `antd info <Component>` primeiro.**

---

## Camada de theming — ConfigProvider

O ponto central de todo visual antd é o `ConfigProvider`. Envolver a aplicação inteira nele.

### Setup mínimo de qualidade

```tsx
import { ConfigProvider, theme } from 'antd';

// Opção 1: light padrão com cor de marca customizada
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1677ff',  // Seed Token — propaga para toda hierarquia
      borderRadius: 8,
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    },
  }}
>
  <App />
</ConfigProvider>

// Opção 2: dark
<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
  <App />
</ConfigProvider>

// Opção 3: dark + compact (dashboards densos)
<ConfigProvider
  theme={{
    algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    token: { colorPrimary: '#36d6ff' },
  }}
>
  <App />
</ConfigProvider>
```

### Hierarquia de Design Tokens

O antd tem 3 camadas — entender isso evita hacks:

```
Seed Token  →  define intenção (colorPrimary, borderRadius)
Map Token   →  derivado pelo algoritmo (colorPrimaryBg, colorPrimaryHover...)
Alias Token →  aplicado nos componentes (colorLink, colorTextHeading...)
```

Mudar um Seed Token propaga por toda a hierarquia automaticamente.
Mudar um Map Token ou Alias Token afeta só aquele token específico.

### Customização por componente

```tsx
<ConfigProvider
  theme={{
    components: {
      Button: {
        borderRadius: 20,           // pill style
        colorPrimary: '#00b96b',
        algorithm: true,            // deriva hover/active/disabled automaticamente
      },
      Card: {
        paddingLG: 28,
        borderRadiusLG: 16,
      },
      Table: {
        borderRadius: 12,
        headerBg: 'rgba(0,0,0,0.03)',
      },
    },
  }}
>
```

---

## Consumir tokens no seu próprio CSS/JSX

Nunca hardcode cores quando há token disponível:

```tsx
import { theme } from 'antd';

const MyComponent = () => {
  const { token } = theme.useToken();

  return (
    <div style={{
      background: token.colorBgContainer,
      padding: token.paddingLG,
      borderRadius: token.borderRadiusLG,
      color: token.colorText,
      border: `1px solid ${token.colorBorderSecondary}`,
    }}>
      Usa tokens — muda com o tema automaticamente
    </div>
  );
};
```

### Tokens mais úteis para composição

```
Cor
  colorPrimary          → cor principal da marca
  colorBgContainer      → fundo de cards/formulários
  colorBgLayout         → fundo da página
  colorBgElevated       → modais, dropdowns, tooltips
  colorBorder           → bordas padrão
  colorBorderSecondary  → bordas mais suaves
  colorText             → texto principal
  colorTextSecondary    → texto secundário/labels
  colorTextDisabled     → disabled
  colorSuccess, colorWarning, colorError, colorInfo

Espaçamento (múltiplos de 8)
  padding, paddingXS, paddingSM, paddingLG, paddingXL
  margin, marginXS, marginSM, marginLG, marginXL

Tipografia
  fontSize, fontSizeSM, fontSizeLG, fontSizeXL, fontSizeHeading1..5
  fontWeightStrong
  lineHeight, lineHeightLG

Forma
  borderRadius, borderRadiusSM, borderRadiusLG, borderRadiusXS
```

---

## Paleta de cores antd

A paleta padrão tem 10 tons por cor (1 = mais claro, 10 = mais escuro).
Instalável para uso programático:

```bash
npm install @ant-design/colors
```

```js
import { blue, green, red, orange, cyan, purple, gold } from '@ant-design/colors';

blue[5]   // '#1677FF' — primary
blue[6]   // '#0958D9' — hover
green[5]  // '#52C41A'
red[5]    // '#FF4D4F'
```

Regra Ant Design para cor de marca: usar o **6º tom** (índice 5) como cor principal.

---

## Tipografia — regras de design

Hierarquia de pesos: regular (400) → medium (500) → semibold (600).
Não usar bold (700) em texto de interface — reservado para display e headings grandes.

Font size padrão antd: **14px** com line-height 22px.
Escala disponível: 12 / 14 / 16 / 20 / 24 / 30 / 38 / 46 / 56 / 68px.

Usar no máximo **3 tamanhos de fonte diferentes** por tela.

```tsx
// Uso correto de Typography
import { Typography } from 'antd';
const { Title, Text, Paragraph } = Typography;

// ✅ Hierarquia clara
<Title level={4}>Título da seção</Title>       // h4 → 20px
<Text type="secondary">Label / descrição</Text> // cinza 45%
<Paragraph>Texto corrido</Paragraph>            // 14px / 22px

// ❌ Evitar
<span style={{ fontSize: 18, fontWeight: 'bold' }}>...</span>  // não usa sistema
```

---

## Layout — sistema de 8px e 24 colunas

Todos os espaçamentos devem ser múltiplos de 8:
`4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96px`

### Grid

```tsx
import { Row, Col } from 'antd';

// 24 colunas totais
<Row gutter={[24, 16]}>           // gutter: [horizontal, vertical]
  <Col xs={24} sm={12} lg={6}>   // responsivo
    <Card>...</Card>
  </Col>
</Row>
```

### Layout de aplicação

```tsx
import { Layout } from 'antd';
const { Header, Sider, Content, Footer } = Layout;

// Padrão enterprise: sidebar + conteúdo
<Layout style={{ minHeight: '100vh' }}>
  <Sider width={240} theme="dark">...</Sider>
  <Layout>
    <Header style={{ background: '#fff', padding: '0 24px' }}>...</Header>
    <Content style={{ margin: '24px', background: '#fff', borderRadius: 8 }}>
      ...
    </Content>
  </Layout>
</Layout>
```

---

## Componentes — como usar no máximo visual

### Space — nunca usar margin manual entre componentes inline

```tsx
import { Space } from 'antd';

<Space size="middle" wrap>    // wrap = quebra linha automaticamente
  <Button>Ação 1</Button>
  <Button type="primary">Confirmar</Button>
</Space>

<Space direction="vertical" size={16} style={{ display: 'flex' }}>
  <Card>...</Card>
  <Card>...</Card>
</Space>
```

### Button — hierarquia obrigatória

```tsx
// Máximo 1 primary button por grupo/tela
<Space>
  <Button>Cancel</Button>
  <Button type="primary">Submit</Button>
</Space>

// Ação destrutiva
<Button danger>Delete</Button>
<Button danger type="primary">Delete permanently</Button>

// Ações secundárias em tabelas
<Button type="link" size="small">Edit</Button>
<Button type="text" icon={<DeleteOutlined />} danger size="small" />

// Loading state — sempre implementar
<Button type="primary" loading={submitting}>
  {submitting ? 'Saving...' : 'Save'}
</Button>
```

### Card — o componente mais versátil

```tsx
// Card padrão
<Card title="Título" extra={<Button type="link">More</Button>}>
  Conteúdo
</Card>

// Metric card (dashboards)
<Card bordered={false} style={{ borderRadius: 12 }}>
  <Statistic
    title="Active Users"
    value={11.28}
    precision={2}
    suffix="%"
    prefix={<ArrowUpOutlined />}
    valueStyle={{ color: token.colorSuccess }}
  />
</Card>

// Card com hover
<Card
  hoverable
  style={{ borderRadius: 12 }}
  styles={{ body: { padding: '20px 24px' } }}
>
  ...
</Card>
```

### Form — melhor prática visual

```tsx
<Form
  layout="vertical"   // melhor para formulários longas / mobile
  // layout="horizontal" para formulários compactos em desktop
  form={form}
  onFinish={handleFinish}
>
  <Form.Item
    label="Email"
    name="email"
    rules={[
      { required: true, message: 'Email is required' },
      { type: 'email', message: 'Invalid email' },
    ]}
  >
    <Input prefix={<MailOutlined />} placeholder="you@email.com" size="large" />
  </Form.Item>

  <Form.Item>
    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
      Submit
    </Button>
  </Form.Item>
</Form>
```

### Table — configuração de qualidade

```tsx
<Table
  dataSource={data}
  columns={columns}
  rowKey="id"
  pagination={{
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `${total} items`,
  }}
  scroll={{ x: 'max-content' }}    // scroll horizontal automático
  rowClassName={(_, index) =>
    index % 2 === 0 ? '' : 'table-row-alt'  // listrado se quiser
  }
/>
```

Colunas com boas práticas:

```tsx
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    ellipsis: true,              // trunca com tooltip automático
    width: 200,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status) => (
      <Tag color={status === 'active' ? 'success' : 'default'}>
        {status}
      </Tag>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',             // gruda coluna na direita
    width: 120,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small">Edit</Button>
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger size="small">Delete</Button>
        </Popconfirm>
      </Space>
    ),
  },
];
```

### Modal — nunca usar alert(), sempre Modal

```tsx
// Confirm pattern correto
import { Modal } from 'antd';

// Para confirmações simples
Modal.confirm({
  title: 'Delete this item?',
  content: 'This action cannot be undone.',
  okText: 'Delete',
  okType: 'danger',
  cancelText: 'Cancel',
  onOk: handleDelete,
});

// Modal com conteúdo
const [open, setOpen] = useState(false);

<Modal
  title="Edit record"
  open={open}
  onCancel={() => setOpen(false)}
  footer={null}                  // footer customizado no form
  width={600}
  destroyOnHidden                // limpa estado ao fechar
>
  <Form ...>...</Form>
</Modal>
```

### Feedback de estado — Spin, Result, Empty, Skeleton

```tsx
// Loading
<Spin spinning={loading} tip="Loading...">
  <div>{content}</div>
</Spin>

// Error state
<Result
  status="error"
  title="Failed to load"
  subTitle="Please try again"
  extra={<Button type="primary" onClick={retry}>Retry</Button>}
/>

// Empty state
<Empty
  image={Empty.PRESENTED_IMAGE_SIMPLE}
  description="No data yet"
>
  <Button type="primary">Create first item</Button>
</Empty>

// Skeleton enquanto carrega
<Skeleton active paragraph={{ rows: 4 }} />
<Skeleton.Button active size="large" block />
<Skeleton.Avatar active />
```

### Notificações e feedback — App component

```tsx
// A forma correta em antd 5+
import { App } from 'antd';

const MyComponent = () => {
  const { message, notification, modal } = App.useApp();

  const handleAction = async () => {
    try {
      await save();
      message.success('Saved successfully');
    } catch {
      notification.error({
        message: 'Error',
        description: 'Could not save. Please try again.',
      });
    }
  };
};

// Envolver a aplicação
<App>
  <MyComponent />
</App>
```

---

## Padrões visuais de alta qualidade

### Dashboard de métricas

```tsx
import { Card, Col, Row, Statistic, Progress, Tag } from 'antd';

<Row gutter={[16, 16]}>
  {metrics.map(m => (
    <Col xs={24} sm={12} xl={6} key={m.key}>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Statistic
          title={<Text type="secondary" style={{ fontSize: 12 }}>{m.label}</Text>}
          value={m.value}
          suffix={m.unit}
          valueStyle={{ fontSize: 28, fontWeight: 600 }}
        />
        {m.progress !== undefined && (
          <Progress
            percent={m.progress}
            size="small"
            showInfo={false}
            strokeColor={m.progress > 80 ? token.colorError : token.colorPrimary}
            style={{ marginTop: 8 }}
          />
        )}
      </Card>
    </Col>
  ))}
</Row>
```

### Filtros de tabela com Segmented

```tsx
import { Segmented } from 'antd';

// Melhor que Radio.Group para filtros visuais
<Segmented
  options={['All', 'Active', 'Inactive']}
  value={filter}
  onChange={setFilter}
/>
```

### Badge de status (melhor que Tag quando é inline)

```tsx
<Badge status="success" text="Running" />
<Badge status="error" text="Failed" />
<Badge status="warning" text="Degraded" />
<Badge status="processing" text="Starting..." />  // pulsante
<Badge status="default" text="Unknown" />
```

### Tag com ícone

```tsx
<Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
<Tag icon={<CloseCircleOutlined />} color="error">Stopped</Tag>
<Tag icon={<SyncOutlined spin />} color="processing">Loading</Tag>
```

### Tooltip em elementos truncados

Usar `ellipsis` com `tooltip` no antd Typography:

```tsx
<Typography.Text
  ellipsis={{ tooltip: fullText }}
  style={{ maxWidth: 200 }}
>
  {fullText}
</Typography.Text>
```

---

## Regras de composição visual

Retiradas do Ant Design spec — seguir sempre:

**1. Hierarquia de botões**
Máximo 1 `type="primary"` por grupo de ações.
Ordem da esquerda para direita: menos importante → mais importante.
Ação destrutiva: usar `danger`, sempre com confirmação.

**2. Density**
Use `compact algorithm` para UIs densas (dashboards, tabelas de dados).
Use tamanho `large` em formulários de entrada principal (login, onboarding).
Use tamanho `small` em ações dentro de tabelas ou cards compactos.

**3. Espaçamento consistente**
Usar `Space`, `Row/Col` e os tokens de padding — nunca margin manual em pixels arbitrários.
Múltiplos de 8 sempre.

**4. Feedback imediato**
Todo botão de submit deve ter `loading` state.
Todo fetch deve ter Spin ou Skeleton.
Todo erro deve ter `Result` ou `notification.error`.
Nenhuma ação destrutiva sem `Popconfirm` ou `Modal.confirm`.

**5. Cores com significado**
Usar cores funcionais apenas para seu propósito:
- success/green → positivo, ativo, sucesso
- warning/orange → atenção, pendente, alto uso
- error/red → falha, parado, crítico
- processing/blue → em andamento, carregando
Não usar cores aleatórias para diferenciação visual — usar `colorPrimary` e variantes.

**6. Acessibilidade mínima**
Todo ícone sem texto precisa de `title` ou `Tooltip`.
Inputs sempre com `label` associado (via `Form.Item`).
Contraste mínimo WCAG AA: seguido automaticamente pelos tokens antd.

---

## Anti-patterns — nunca fazer com antd

| Evitar | Fazer no lugar |
|---|---|
| Misturar CSS global com `!important` para sobrescrever antd | Usar `theme.components` no ConfigProvider |
| Usar `antd` v4 APIs em projeto v5 | Rodar `antd lint ./src` antes |
| Criar loading state manual com `useState` para mensagens | Usar `App.useApp()` do antd 5 |
| Alert nativo do browser | `Modal.confirm()` |
| Confirm nativo | `Popconfirm` ou `Modal.confirm()` |
| Múltiplos `type="primary"` na mesma tela | Um primário, resto default/text/link |
| Colors hardcoded (`#ff0000`) | `token.colorError` ou `colorErrorText` |
| Margin/padding em px arbitrários | Tokens de espaçamento ou múltiplos de 8 |
| `style={{ display: 'flex', gap: 8 }}` entre botões | `<Space>` |
| Spinner customizado | `<Spin>` |
| `window.alert()` ou `window.confirm()` | `message.error()` / `Modal.confirm()` |

---

## Verificação antes de entregar

Rodar sempre após modificar código antd:

```bash
antd lint ./src --format json          # detecta APIs deprecated e problemas
antd doctor --format json              # diagnóstico do projeto
```

Cheklist visual:
- [ ] Todos os estados implementados: loading, error, empty, success
- [ ] Nenhum botão `type="primary"` duplicado na mesma view
- [ ] Formulários com `Form.Item` e validation messages
- [ ] Ações destrutivas com confirmação
- [ ] Responsividade com `Row/Col` e breakpoints xs/sm/md/lg/xl
- [ ] Tema aplicado via `ConfigProvider`, não CSS global
- [ ] `App.useApp()` para notifications/messages/modals

---

## Para projetos novos — stack recomendada com antd

| Categoria | Recomendado |
|---|---|
| Framework | Next.js + antd ou Vite + React + antd |
| Estado async | ahooks (`useRequest`) |
| Formulários complexos | ProForm (Pro Components) |
| Tabelas complexas | ProTable (Pro Components) |
| Charts | Ant Design Charts ou AntV |
| Animações | motion (Framer Motion) |
| Ícones | `@ant-design/icons` (já incluso no antd) |
| i18n | react-i18next + `ConfigProvider locale` |

Documentação LLMs-friendly (passar como contexto extra quando necessário):
- Componente específico: `https://ant.design/components/<name>.md`
- Tudo em inglês: `https://ant.design/llms-full.txt`