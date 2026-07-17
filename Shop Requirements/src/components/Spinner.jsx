import '../styles/Spinner.css'

export default function Spinner({ size = 'md', label }) {
  return (
    <span className={`spinner spinner-${size}`} role="status" aria-label={label || 'Loading'}>
      <span className="spinner-ring" />
      {label && <span className="spinner-label">{label}</span>}
    </span>
  )
}
