import { useState, useCallback, useEffect } from 'react'
import { getDashboard } from '../services/api.js'

const EMPTY_DASHBOARD = {
  meta: {
    totalRequirements: 0,
    totalItems: 0,
    totalQuantity: 0,
    lastUpdated: null,
  },
  requirements: [],
  summary: [],
}

export function useDashboard() {
  const [data, setData] = useState(EMPTY_DASHBOARD)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDashboard()
      setData({
        meta: { ...EMPTY_DASHBOARD.meta, ...(result?.meta || {}) },
        requirements: result?.requirements || [],
        summary: result?.summary || [],
      })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { data, loading, error, refresh: fetchDashboard }
}
