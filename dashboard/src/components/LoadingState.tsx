import { Spin, Result, Button, Empty } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="state-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px' }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      <p className="state-text" style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>{message}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-container state-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px' }}>
      <Result
        status="error"
        title={<span style={{ color: 'var(--text-main)', fontSize: '16px' }}>Error</span>}
        subTitle={<span style={{ color: 'var(--text-soft)', fontSize: '13px' }}>{message}</span>}
        extra={onRetry ? [
          <Button key="retry" type="primary" onClick={onRetry} style={{ background: 'var(--accent-primary)', color: 'var(--bg-deep)', fontWeight: 600 }}>
            Try Again
          </Button>
        ] : []}
        style={{ padding: 0 }}
      />
    </div>
  )
}

export function EmptyState({ message = 'No data available.' }: { message?: string }) {
  return (
    <div className="state-container state-muted" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px' }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{message}</span>}
      />
    </div>
  )
}

