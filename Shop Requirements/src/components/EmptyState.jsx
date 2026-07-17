import '../styles/States.css'

export default function EmptyState({ icon = '📦', title, description }) {
  return (
    <div className="state-panel empty-state">
      <div className="state-icon" aria-hidden="true">{icon}</div>
      <h3 className="state-title">{title}</h3>
      {description && <p className="state-description">{description}</p>}
    </div>
  )
}
