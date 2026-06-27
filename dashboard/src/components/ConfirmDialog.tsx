// ConfirmDialog — modal for dangerous actions
interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({ message, onConfirm, onCancel, variant = 'danger' }: ConfirmDialogProps) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true">
      <div className="dialog-box">
        <div className={`dialog-icon dialog-icon-${variant}`}>{variant === 'danger' ? '⚠' : '!'}</div>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel} id="confirm-dialog-cancel">
            Cancel
          </button>
          <button className={`btn btn-${variant}`} onClick={onConfirm} id="confirm-dialog-confirm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
