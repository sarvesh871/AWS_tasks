import '../styles/States.css'

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="state-panel error-state">
      <div className="state-icon" aria-hidden="true">⚠️</div>
      <h3 className="state-title">{title}</h3>
      {description && <p className="state-description">{description}</p>}
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
