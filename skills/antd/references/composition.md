# antd — Padrões de Composição Visual

Receitas prontas para interfaces bonitas e consistentes com antd.

---

## Layout de aplicação enterprise

### Sidebar + Content (padrão mais comum)

```tsx
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined, SettingOutlined, LogoutOutlined,
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Sider, Header, Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const userMenu = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        {/* Logo */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: collapsed ? '0 24px' : '0 24px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <span style={{ fontWeight: 700, fontSize: collapsed ? 16 : 18 }}>
            {collapsed ? '★' : 'MyApp'}
          </span>
        </div>

        <Menu
          mode="inline"
          items={menuItems}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </Header>

        <Content style={{ margin: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
```

---

## Page header padrão

```tsx
import { Breadcrumb, Button, Space, Typography, Divider } from 'antd';

const PageHeader = ({ title, description, breadcrumbs, actions }) => (
  <div style={{ marginBottom: 24 }}>
    {breadcrumbs && (
      <Breadcrumb
        items={breadcrumbs}
        style={{ marginBottom: 8 }}
      />
    )}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Text type="secondary">{description}</Typography.Text>
        )}
      </div>
      {actions && <Space>{actions}</Space>}
    </div>
    <Divider style={{ marginTop: 16, marginBottom: 0 }} />
  </div>
);

// Uso
<PageHeader
  title="Services"
  description="Manage system services"
  breadcrumbs={[{ title: 'Home' }, { title: 'Services' }]}
  actions={[
    <Button>Refresh</Button>,
    <Button type="primary" icon={<PlusOutlined />}>Add</Button>,
  ]}
/>
```

---

## Tabela com filtros, busca e actions

```tsx
import { Table, Input, Select, Space, Button, Tag, Popconfirm, Card } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const DataTable = ({ data, loading, onDelete, onCreate }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  const filtered = data
    .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))
    .filter(item => !statusFilter || item.status === statusFilter);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status) => {
        const map = {
          active:   { color: 'success', text: 'Active' },
          inactive: { color: 'default', text: 'Inactive' },
          error:    { color: 'error',   text: 'Error' },
        };
        const { color, text } = map[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">Edit</Button>
          <Popconfirm
            title="Delete this item?"
            description="This action cannot be undone."
            okText="Delete"
            okType="danger"
            onConfirm={() => onDelete(record.id)}
          >
            <Button type="link" danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      styles={{ body: { padding: 0 } }}
    >
      {/* Toolbar */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{ width: 240 }}
        />
        <Select
          placeholder="Status"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'error', label: 'Error' },
          ]}
        />
        <div style={{ marginLeft: 'auto' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Create
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, [s, e]) => `${s}-${e} of ${total}`,
        }}
      />
    </Card>
  );
};
```

---

## Modal de criação/edição

```tsx
import { Modal, Form, Input, Select, Button, Space } from 'antd';

const RecordModal = ({ open, record, onSave, onCancel, loading }) => {
  const [form] = Form.useForm();

  // Preencher form ao editar
  useEffect(() => {
    if (open) {
      form.setFieldsValue(record || {});
    }
  }, [open, record]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await onSave(values);
  };

  return (
    <Modal
      title={record ? 'Edit Record' : 'Create Record'}
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={handleSave}>
            {record ? 'Save changes' : 'Create'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
```

---

## Dashboard de métricas — padrão completo

```tsx
import { Row, Col, Card, Statistic, Progress, Badge, Flex } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const MetricsRow = ({ metrics }) => {
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]}>
      {metrics.map(m => (
        <Col xs={24} sm={12} xl={6} key={m.key}>
          <Card
            bordered={false}
            style={{ borderRadius: token.borderRadiusLG }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Flex justify="space-between" align="flex-start">
              <div>
                <div style={{
                  fontSize: token.fontSizeSM,
                  color: token.colorTextSecondary,
                  marginBottom: 4,
                }}>
                  {m.label}
                </div>
                <Statistic
                  value={m.value}
                  suffix={m.unit}
                  valueStyle={{ fontSize: 28, fontWeight: 600 }}
                  prefix={m.trend > 0
                    ? <ArrowUpOutlined style={{ color: token.colorSuccess }} />
                    : <ArrowDownOutlined style={{ color: token.colorError }} />
                  }
                />
              </div>
              {m.icon && (
                <div style={{
                  background: token.colorPrimaryBg,
                  color: token.colorPrimary,
                  width: 44,
                  height: 44,
                  borderRadius: token.borderRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {m.icon}
                </div>
              )}
            </Flex>

            {m.progress !== undefined && (
              <Progress
                percent={m.progress}
                size="small"
                showInfo={false}
                strokeColor={
                  m.progress >= 90 ? token.colorError :
                  m.progress >= 70 ? token.colorWarning :
                  token.colorPrimary
                }
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};
```

---

## Lista de status com Badge

```tsx
import { List, Badge, Space, Typography } from 'antd';

const ServiceList = ({ services }) => (
  <List
    dataSource={services}
    renderItem={item => (
      <List.Item
        actions={[
          <Button size="small" type="text">Restart</Button>,
          <Button size="small" type="text" danger>Stop</Button>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <Badge
              status={item.active ? 'success' : 'error'}
              style={{ marginTop: 4 }}
            />
          }
          title={item.name}
          description={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {item.pid && `PID: ${item.pid} · `}{item.uptime}
            </Typography.Text>
          }
        />
      </List.Item>
    )}
  />
);
```

---

## Formulário de login premium

```tsx
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage = ({ onLogin, loading }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  return (
    <div style={{
      minHeight: '100vh',
      background: token.colorBgLayout,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Card
        style={{ width: 400, borderRadius: token.borderRadiusLG }}
        styles={{ body: { padding: 40 } }}
      >
        <Space direction="vertical" size={0} style={{ display: 'flex', marginBottom: 32 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Welcome back
          </Typography.Title>
          <Typography.Text type="secondary">
            Sign in to your account
          </Typography.Text>
        </Space>

        <Form form={form} layout="vertical" onFinish={onLogin} size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextDisabled }} />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextDisabled }} />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
```

---

## Estados vazios e de erro — padrões

```tsx
import { Result, Empty, Button } from 'antd';

// Empty state customizado
<Empty
  image={<InboxOutlined style={{ fontSize: 48, color: token.colorTextDisabled }} />}
  imageStyle={{ height: 'auto' }}
  description={
    <Typography.Text type="secondary">
      No items yet. Create your first one.
    </Typography.Text>
  }
>
  <Button type="primary" icon={<PlusOutlined />}>Create</Button>
</Empty>

// Error state
<Result
  status="error"
  title="Failed to load data"
  subTitle="An unexpected error occurred. Please try again."
  extra={[
    <Button type="primary" onClick={onRetry} key="retry">Try again</Button>,
    <Button onClick={onBack} key="back">Go back</Button>,
  ]}
/>

// 403
<Result
  status="403"
  title="Access denied"
  subTitle="You don't have permission to access this page."
  extra={<Button type="primary" onClick={goHome}>Go home</Button>}
/>
```

---

## Notificações — padrões completos

```tsx
// Sempre usar App.useApp() em v5+

const { message, notification } = App.useApp();

// Sucesso simples
message.success('Saved successfully');

// Erro com detalhe
notification.error({
  message: 'Save failed',
  description: error.message || 'Please try again later.',
  duration: 5,
});

// Loading → success
const key = 'saving';
message.loading({ content: 'Saving...', key });
try {
  await save();
  message.success({ content: 'Saved!', key, duration: 2 });
} catch {
  message.error({ content: 'Failed to save.', key, duration: 3 });
}
```