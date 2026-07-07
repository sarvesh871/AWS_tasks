import { useCallback, useEffect, useRef, useState } from "react";
import { getDashboard } from "../services/api";
import { AUTO_REFRESH_INTERVAL_MS } from "../config";

/**
 * Loads dashboard stats + recent incidents, auto-refreshing on an interval.
 * Exposes a manual refresh() for post-upload updates.
 */
export function useDashboard() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFirstLoad = useRef(true);

  const fetchDashboard = useCallback(async () => {
    if (!isFirstLoad.current) setIsRefreshing(true);
    try {
      const result = await getDashboard();
      setData(result);
      setStatus("success");
      setError(null);
    } catch (err) {
      if (isFirstLoad.current) {
        setStatus("error");
      }
      setError(err.message || "Something went wrong while loading the dashboard.");
    } finally {
      isFirstLoad.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return { data, status, error, isRefreshing, refresh: fetchDashboard };
}
