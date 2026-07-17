import { useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import Spinner from '../components/Spinner.jsx'
import { sendSummary } from '../services/api.js'
import { formatDateTime } from '../utils/formatDate.js'
import '../styles/PurchaseSummary.css'

const ITEM_ICONS = {
  Rice: '🍚',
  Sugar: '🧂',
  Salt: '🧊',
  Oil: '🛢️',
  Milk: '🥛',
  Bread: '🍞',
  Eggs: '🥚',
}

function iconFor(item) {
  return ITEM_ICONS[item] || '📦'
}

export default function PurchaseSummary({ summary, loading, error, onRetry, onSuccess, showToast }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleNotify() {
    setSending(true)
    try {
      const result = await sendSummary()
      if (result?.success) {
          setSent(true)
          showToast(
              result.message || "Summary sent successfully.",
              "success"
          )
          if (onSuccess) {
              await onSuccess()
          }
      } else {
        showToast('Manager was not notified. Please try again.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Failed to notify manager.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="summary-page">
      <div className="glass-panel summary-panel">
        <div className="panel-header">
          <h2>Purchase summary</h2>
          <p>Aggregated quantities across all shops, by item.</p>
        </div>

        {loading && (
          <div className="summary-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {!loading && error && <ErrorState description={error} onRetry={onRetry} />}

        {!loading && !error && summary.length === 0 && (
          <EmptyState
            icon="📊"
            title="No summary yet"
            description="Submit a few requirements to see item totals here."
          />
        )}

        {!loading && !error && summary.length > 0 && (
          <div className="summary-grid">
            {summary.map((item, index) => (
              <div
                className="summary-card"
                key={`${item.item}-${index}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="summary-card-icon" aria-hidden="true">
                  {iconFor(item.item)}
                </div>
                <div className="summary-card-name">{item.item}</div>
                <div className="summary-card-qty">{item.totalQuantity}</div>
                <div className="summary-card-label">total quantity</div>
                <div className="summary-card-updated">
                  Updated {formatDateTime(item.lastUpdated)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="notify-section">
          <button
            type="button"
            className="btn btn-primary notify-btn"
            onClick={handleNotify}
            disabled={sending}
          >
            {sending ? (
              <Spinner size="sm" label="Sending…" />
            ) : (
              <>
                <span aria-hidden="true">📣</span> Notify manager
              </>
            )}
          </button>
          {sent && <span className="notify-success">✓ Manager notified successfully</span>}
        </div>
      </div>
    </div>
  )
}
