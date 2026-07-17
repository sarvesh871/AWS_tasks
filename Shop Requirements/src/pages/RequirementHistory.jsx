import { useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { formatDateTime } from '../utils/formatDate.js'
import '../styles/RequirementHistory.css'

function StatusBadge({ status }) {
  const normalized = (status || 'PENDING').toUpperCase()
  return <span className={`status-badge status-${normalized.toLowerCase()}`}>{normalized}</span>
}

export default function RequirementHistory({ requirements, loading, error, onRetry }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const sorted = [...requirements].sort(
      (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
    )
    if (!query.trim()) return sorted
    const q = query.trim().toLowerCase()
    return sorted.filter((req) =>
      [req.shopName, req.item, req.status].some((field) =>
        (field || '').toLowerCase().includes(q)
      )
    )
  }, [requirements, query])

  return (
    <div className="history-page">
      <div className="glass-panel history-panel">
        <div className="panel-header history-header">
          <div>
            <h2>Requirement history</h2>
            <p>Every requirement received, newest first.</p>
          </div>
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              placeholder="Search by shop, item or status"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search requirement history"
            />
          </div>
        </div>

        {loading && (
          <div className="history-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        )}

        {!loading && error && <ErrorState description={error} onRetry={onRetry} />}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon="🗒️"
            title={query ? 'No matching requirements' : 'No requirements yet'}
            description={
              query ? 'Try a different search term.' : 'Submitted requirements will show up here.'
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Shop name</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req, index) => (
                    <tr key={`${req.shopName}-${req.item}-${req.receivedAt}-${index}`}>
                      <td data-label="Shop name">{req.shopName}</td>
                      <td data-label="Item">{req.item}</td>
                      <td data-label="Quantity">{req.quantity}</td>
                      <td data-label="Status">
                        <StatusBadge status={req.status} />
                      </td>
                      <td data-label="Received">{formatDateTime(req.receivedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="history-cards">
              {filtered.map((req, index) => (
                <div
                  className="history-card"
                  key={`card-${req.shopName}-${req.item}-${req.receivedAt}-${index}`}
                >
                  <div className="history-card-top">
                    <span className="history-card-shop">{req.shopName}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="history-card-row">
                    <span>Item</span>
                    <strong>{req.item}</strong>
                  </div>
                  <div className="history-card-row">
                    <span>Quantity</span>
                    <strong>{req.quantity}</strong>
                  </div>
                  <div className="history-card-row">
                    <span>Received</span>
                    <strong>{formatDateTime(req.receivedAt)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
