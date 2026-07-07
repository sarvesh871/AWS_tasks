import { useCountUp } from "../hooks/useCountUp.js";
import "../styles/StatCard.css";

function StatCard({ icon: Icon, label, value, color }) {
  const animatedValue = useCountUp(value);

  return (
    <div className="stat-card glass" style={{ "--stat-color": color }}>
      <div className="stat-card__icon">
        <Icon size={26} strokeWidth={2} />
      </div>
      <div className="stat-card__value">{animatedValue.toLocaleString()}</div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__bar" aria-hidden="true" />
    </div>
  );
}

export default StatCard;
