import { RadioTower } from "lucide-react";
import "../styles/EmptyState.css";

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__illustration">
        <RadioTower size={36} />
        <span className="empty-state__pulse" aria-hidden="true" />
      </div>
      <h3 className="empty-state__title">No incidents reported yet.</h3>
      <p className="empty-state__subtitle">
        Once citizens start reporting incidents, they'll show up here in real time.
      </p>
    </div>
  );
}

export default EmptyState;
