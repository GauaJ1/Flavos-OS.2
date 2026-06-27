// Loading & Error states
export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="state-container">
      <div className="spinner" aria-label="Loading" />
      <p className="state-text">{message}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-container state-error">
      <span className="state-icon">⚠</span>
      <p className="state-text">{message}</p>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'No data available.' }: { message?: string }) {
  return (
    <div className="state-container state-muted">
      <span className="state-icon">◌</span>
      <p className="state-text">{message}</p>
    </div>
  )
}
