import { Building2 } from "lucide-react";
import { useClock } from "../hooks/useClock.js";
import "../styles/Navbar.css";

function Navbar() {
  const { date, time } = useClock();

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <div className="navbar__brand">
          <span className="navbar__logo">
            <Building2 size={22} strokeWidth={2.2} />
          </span>
          <div className="navbar__title-group">
            <span className="navbar__title">Smart City</span>
            <span className="navbar__subtitle">Incident Reporting System</span>
          </div>
        </div>

        <div className="navbar__status">
          <span className="navbar__live">
            <span className="navbar__live-dot" aria-hidden="true" />
            Live
          </span>
          <div className="navbar__divider" aria-hidden="true" />
          <div className="navbar__datetime">
            <span className="navbar__date">{date}</span>
            <span className="navbar__time">{time}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
