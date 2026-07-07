import { Building2 } from "lucide-react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Building2 size={16} />
          Smart City Incident Reporting System
        </div>
        <p className="footer__note">
          Incident data is captured and classified automatically using AI image recognition.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
