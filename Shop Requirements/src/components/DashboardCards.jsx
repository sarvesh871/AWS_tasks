import AnimatedCounter from './AnimatedCounter.jsx'
import { formatRelativeTime, formatDateTime } from '../utils/formatDate.js'
import '../styles/Dashboard.css'

const CARDS = [
  {
    key: 'totalRequirements',
    label: 'Total Requirements',
    icon: '📋',
    gradient: 'gradient-blue',
  },
  {
    key: 'totalItems',
    label: 'Total Items',
    icon: '🗂️',
    gradient: 'gradient-cyan',
  },
  {
    key: 'totalQuantity',
    label: 'Total Quantity',
    icon: '📦',
    gradient: 'gradient-indigo',
  },
]

export default function DashboardCards({ meta, loading }) {
  return (
    <section className="dashboard-cards" aria-label="Dashboard summary">
      {CARDS.map((card, index) => (
        <div
          key={card.key}
          className={`dashboard-card ${card.gradient}`}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <div className="dashboard-card-icon" aria-hidden="true">{card.icon}</div>
          <div className="dashboard-card-body">
            <span className="dashboard-card-label">{card.label}</span>
            <span className="dashboard-card-value">
              {loading ? (
                <span className="skeleton-line" />
              ) : (
                <AnimatedCounter value={meta?.[card.key] || 0} />
              )}
            </span>
          </div>
        </div>
      ))}

      <div
        className="dashboard-card gradient-slate dashboard-card-updated"
        style={{ animationDelay: '270ms' }}
      >
        <div className="dashboard-card-icon" aria-hidden="true">🕒</div>
        <div className="dashboard-card-body">
          <span className="dashboard-card-label">Last Updated</span>
          <span className="dashboard-card-value dashboard-card-value-sm">
            {loading ? (
              <span className="skeleton-line" />
            ) : (
              <span title={formatDateTime(meta?.lastUpdated)}>
                {formatRelativeTime(meta?.lastUpdated)}
              </span>
            )}
          </span>
        </div>
      </div>
    </section>
  )
}
