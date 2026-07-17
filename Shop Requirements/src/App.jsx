import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import DashboardCards from './components/DashboardCards.jsx'
import ToastContainer from './components/Toast.jsx'
import SubmitRequirement from './pages/SubmitRequirement.jsx'
import RequirementHistory from './pages/RequirementHistory.jsx'
import PurchaseSummary from './pages/PurchaseSummary.jsx'
import { useDashboard } from './hooks/useDashboard.js'
import { useToast } from './hooks/useToast.js'
import './styles/App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('submit')
  const { data, loading, error, refresh } = useDashboard()
  const { toasts, showToast, removeToast } = useToast()

  return (
    <div className="app-shell">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="app-main">
        <DashboardCards meta={data.meta} loading={loading} />

        <div className="tab-content" key={activeTab}>
          {activeTab === 'submit' && (
            <SubmitRequirement onSuccess={refresh} showToast={showToast} />
          )}

          {activeTab === 'history' && (
            <RequirementHistory
              requirements={data.requirements}
              loading={loading}
              error={error}
              onRetry={refresh}
            />
          )}

          {activeTab === 'summary' && (
            <PurchaseSummary
              summary={data.summary}
              loading={loading}
              error={error}
              onRetry={refresh}
              onSuccess={refresh}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
