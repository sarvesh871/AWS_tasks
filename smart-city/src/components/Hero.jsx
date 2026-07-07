import { ScanEye, UploadCloud } from "lucide-react";
import "../styles/Hero.css";

function Hero({ onUploadClick }) {
  return (
    <section className="hero">
      <div className="hero__inner container">
        <span className="hero__eyebrow">
          <ScanEye size={14} />
          AI-powered incident recognition using Amazon Rekognition
        </span>

        <h1 className="hero__title">
          Smart City <span className="hero__title-accent">Monitoring Dashboard</span>
        </h1>

        <p className="hero__subtitle">
          Track potholes, traffic hazards, garbage overflow, and street light faults across the
          city in real time — reported by citizens, verified by AI.
        </p>

        <button className="hero__cta" onClick={onUploadClick}>
          <UploadCloud size={20} />
          Upload Incident
        </button>
      </div>

      <div className="hero__glow" aria-hidden="true" />
    </section>
  );
}

export default Hero;
