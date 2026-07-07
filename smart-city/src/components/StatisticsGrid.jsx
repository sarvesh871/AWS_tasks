import { ClipboardList, Construction, Lightbulb, TrafficCone, Trash2 } from "lucide-react";
import StatCard from "./StatCard.jsx";
import LoadingSkeleton from "./LoadingSkeleton.jsx";
import "../styles/StatisticsGrid.css";

const CATEGORY_CONFIG = [
  { key: "potholes", label: "Potholes", icon: Construction, color: "var(--color-pothole)" },
  { key: "traffic", label: "Traffic", icon: TrafficCone, color: "var(--color-traffic)" },
  { key: "garbage", label: "Garbage", icon: Trash2, color: "var(--color-garbage)" },
  { key: "streetlights", label: "Street Lights", icon: Lightbulb, color: "var(--color-streetlight)" },
];

const TOTAL_CONFIG = {
  key: "total",
  label: "Total Incidents",
  icon: ClipboardList,
  color: "var(--color-accent)",
};

// Accepts a variety of possible key shapes from the API and normalizes them.
const readStat = (stats, key) => {
  if (!stats) return 0;
  const aliases = {
    total: ["total", "totalIncidents", "total_incidents", "count", "all"],
    potholes: ["potholes", "pothole"],
    traffic: ["traffic"],
    garbage: ["garbage"],
    streetlights: ["streetlights", "streetlight", "street_lights", "street_light"],
  };
  for (const alias of aliases[key]) {
    if (typeof stats[alias] === "number") return stats[alias];
  }
  return 0;
};

function StatSection({ title, subtitle, cards, stats, isLoading }) {
  return (
    <section className="stats-grid">
      <div className="container">
        <div className="stats-grid__header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="stats-grid__inner" data-count={cards.length}>
          {isLoading
            ? cards.map((c) => <LoadingSkeleton key={c.key} variant="stat" />)
            : cards.map((c) => (
                <StatCard
                  key={c.key}
                  icon={c.icon}
                  label={c.label}
                  value={readStat(stats, c.key)}
                  color={c.color}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

function StatisticsGrid({ recentStats, overallStats, isLoading }) {
  return (
    <>
      <StatSection
        title="Incident Reports (Last 10 Minutes)"
        subtitle="Live counts for incidents reported in the last 10 minutes."
        cards={CATEGORY_CONFIG}
        stats={recentStats}
        isLoading={isLoading}
      />
      <StatSection
        title="Overall Incident Statistics"
        subtitle="All-time totals across every incident on record."
        cards={[TOTAL_CONFIG, ...CATEGORY_CONFIG]}
        stats={overallStats}
        isLoading={isLoading}
      />
    </>
  );
}

export default StatisticsGrid;
