import { useEffect, useState } from "react";
import { Clock, ImageOff, Loader2, ShieldCheck, Tag, Trash2, X } from "lucide-react";
import { getIncident, deleteIncident } from "../services/api.js";
import { getCategoryMeta } from "../config.js";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll.js";
import ConfirmModal from "./ConfirmModal";
import "../styles/IncidentModal.css";

const formatTime = (value) => {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function IncidentModal({ incident, onClose, onDeleted }) {
  const [detail, setDetail] = useState(incident);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useLockBodyScroll(Boolean(incident));

  useEffect(() => {
    setDetail(incident);
    setImageFailed(false);
    setShowDelete(false);
    setDeleteError(null);
    if (!incident) return;

    const imageId = incident.imageId || incident.id;
    if (!imageId) return;

    let cancelled = false;
    setIsLoadingDetail(true);

    getIncident(imageId)
      .then((full) => {
        if (!cancelled) setDetail((prev) => ({ ...prev, ...full }));
      })
      .catch(() => {
        /* Keep showing the summary data already available. */
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [incident]);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!incident) return null;

  // Always use detailed data if available.
  // Otherwise keep showing the dashboard data.
  const current = detail || incident;

  const meta = getCategoryMeta(current.category);

  const confidence =
    current.confidence != null
      ? Math.min(100, Math.round(current.confidence))
      : null;

  const labels =
    current.labels ||
    current.detectedLabels ||
    [];

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteIncident(current.imageId);
      setShowDelete(false);
      onClose();
      // Let the dashboard re-fetch stats + recent incidents instead of a
      // full page reload, so state updates in place with no flash.
      onDeleted?.(current.imageId);
    } catch {
      setDeleteError("Unable to delete incident. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="incident-modal__overlay" onClick={onClose}>
      <div
        className="incident-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Incident details"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="incident-modal__header-actions">
          <button
            className="incident-modal__icon-btn incident-modal__icon-btn--danger"
            onClick={() => setShowDelete(true)}
            aria-label="Delete incident"
            data-tooltip="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="incident-modal__icon-btn"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="incident-modal__scroll">
          <div className="incident-modal__image-wrap">
            {imageFailed || !current.imageUrl ? (
              <div className="incident-modal__image-fallback">
                <ImageOff size={36} />
              </div>
            ) : (
              <img
                src={current.imageUrl}
                alt={meta.label}
                className="incident-modal__image"
                onError={() => setImageFailed(true)}
              />
            )}
            <span className="incident-modal__badge" style={{ "--badge-color": meta.color }}>
              <Tag size={13} />
              {meta.label}
            </span>
          </div>

          <div className="incident-modal__body">
            <div className="incident-modal__info-row">
              {confidence !== null && (
                <span className="incident-modal__confidence">
                  <ShieldCheck size={15} />
                  {confidence}% confidence
                </span>
              )}
              {current.status && (
                <span className={`incident-modal__status incident-modal__status--${current.status.toLowerCase()}`}>
                  {current.status}
                </span>
              )}
              {isLoadingDetail && (
                <span className="incident-modal__loading">
                  <Loader2 size={14} className="incident-modal__spinner" />
                  Loading details
                </span>
              )}
            </div>

            <h2 className="incident-modal__title">{meta.label}</h2>

            <p className="incident-modal__summary">
              {current.summary || "No summary available for this incident."}
            </p>

            {labels.length > 0 && (
              <div className="incident-modal__labels">
                {labels.map((label, i) => (
                  <span key={i} className="incident-modal__chip">
                    {typeof label === "string" ? label : label.name}
                  </span>
                ))}
              </div>
            )}

            {deleteError && <p className="incident-modal__delete-error">{deleteError}</p>}

            <div className="incident-modal__footer-row">
              <Clock size={14} />
              Reported {formatTime(current.reportedAt || current.reported_time)}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        title="Delete Incident"
        description="This incident and its uploaded image will be permanently deleted. This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        danger
        onCancel={() => setShowDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default IncidentModal;
