import { RefreshCw, TriangleAlert } from "lucide-react";
import "../styles/ErrorState.css";

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state__icon">
        <TriangleAlert size={30} />
      </div>
      <h3 className="error-state__title">Something went wrong.</h3>
      <p className="error-state__subtitle">
        {message || "We couldn't reach the server. Please check your connection and try again."}
      </p>
      <button className="error-state__retry" onClick={onRetry}>
        <RefreshCw size={16} />
        Retry
      </button>
    </div>
  );
}

export default ErrorState;
