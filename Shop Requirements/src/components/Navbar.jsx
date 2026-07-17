import '../styles/Navbar.css'

const TABS = [
  { key: 'submit', label: 'Submit Requirement', icon: '📝' },
  { key: 'history', label: 'Requirement History', icon: '📜' },
  { key: 'summary', label: 'Purchase Summary', icon: '📊' },
]

export default function Navbar({ activeTab, onTabChange }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">◆</span>
          <div className="navbar-titles">
            <span className="navbar-title">Inventory Dashboard</span>
            <span className="navbar-subtitle">Shop requirement tracking</span>
          </div>
        </div>

        <nav className="navbar-tabs" aria-label="Primary">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`navbar-tab ${activeTab === tab.key ? 'navbar-tab-active' : ''}`}
              onClick={() => onTabChange(tab.key)}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              <span className="navbar-tab-icon" aria-hidden="true">{tab.icon}</span>
              <span className="navbar-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
