import "../styles/LoadingSkeleton.css";

function LoadingSkeleton({ variant = "card" }) {
  if (variant === "stat") {
    return (
      <div className="skeleton skeleton--stat glass">
        <div className="skeleton__block skeleton__icon" />
        <div className="skeleton__block skeleton__line skeleton__line--lg" />
        <div className="skeleton__block skeleton__line skeleton__line--sm" />
      </div>
    );
  }

  return (
    <div className="skeleton skeleton--card glass">
      <div className="skeleton__block skeleton__image" />
      <div className="skeleton__body">
        <div className="skeleton__block skeleton__line skeleton__line--sm" />
        <div className="skeleton__block skeleton__line skeleton__line--lg" />
        <div className="skeleton__block skeleton__line skeleton__line--md" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
