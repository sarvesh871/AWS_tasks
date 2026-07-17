import '../styles/Toast.css'

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon" aria-hidden="true">{ICONS[toast.type] || ICONS.info}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
