import IncidentCard from "./IncidentCard.jsx";
import LoadingSkeleton from "./LoadingSkeleton.jsx";
import EmptyState from "./EmptyState.jsx";
import ErrorState from "./ErrorState.jsx";
import "../styles/IncidentGrid.css";

function IncidentGrid({ incidents, isLoading, error, onRetry, onOpenIncident }) {
  return (
    <section className="incident-grid-section">
      <div className="container">
        <div className="incident-grid-section__header">
          <h2>Recent Incidents</h2>
          <p>Latest reports verified by AI image recognition.</p>
        </div>

        {isLoading ? (
          <div className="incident-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : !incidents || incidents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="incident-grid">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.imageId || incident.id}
                incident={incident}
                onOpen={onOpenIncident}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default IncidentGrid;
