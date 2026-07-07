import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import "../styles/Toast.css";

function Toast({ message, onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} className="toast__icon" />
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onDismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;
