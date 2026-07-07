import { Clock, ImageOff } from "lucide-react";
import { useState } from "react";
import { getCategoryMeta } from "../config.js";
import "../styles/IncidentCard.css";

const formatTime = (value) => {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function IncidentCard({ incident, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false);
  const meta = getCategoryMeta(incident.category);
  const confidence = incident.confidence ? Math.round(incident.confidence) : null;

  return (
    <button className="incident-card glass" onClick={() => onOpen(incident)}>
      <div className="incident-card__image-wrap">
        {imageFailed || !incident.imageUrl ? (
          <div className="incident-card__image-fallback">
            <ImageOff size={28} />
          </div>
        ) : (
          <img
            src={incident.imageUrl}
            alt={meta.label}
            loading="lazy"
            className="incident-card__image"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="incident-card__badge" style={{ "--badge-color": meta.color }}>
          {meta.label}
        </span>
      </div>

      <div className="incident-card__body">
        <div className="incident-card__top-row">
          {confidence !== null && (
            <span className="incident-card__confidence">{confidence}% confidence</span>
          )}
          {incident.status && (
            <span className={`incident-card__status incident-card__status--${incident.status.toLowerCase()}`}>
              {incident.status}
            </span>
          )}
        </div>

        <p className="incident-card__summary">
          {incident.summary || "No summary available for this incident."}
        </p>

        <div className="incident-card__time">
          <Clock size={13} />
          {formatTime(incident.reportedAt || incident.timestamp)}
        </div>
      </div>
    </button>
  );
}

export default IncidentCard;
