import { useRef, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import UploadArea from "../components/UploadArea.jsx";
import StatisticsGrid from "../components/StatisticsGrid.jsx";
import IncidentGrid from "../components/IncidentGrid.jsx";
import IncidentModal from "../components/IncidentModal.jsx";
import Toast from "../components/Toast.jsx";
import Footer from "../components/Footer.jsx";
import { useDashboard } from "../hooks/useDashboard.js";

function Dashboard() {
  const { data, status, error, refresh } = useDashboard();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const uploadSectionRef = useRef(null);

  const isLoading = status === "loading";
  const isError = status === "error";

  const handleUploadClick = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleUploadSuccess = () => {
    setToastMessage("Incident uploaded successfully.");
    // The image still needs to go through Rekognition and land in RDS, so
    // we give the pipeline a moment before pulling fresh stats + incidents.
    // This is a one-off refresh triggered by the upload itself -- it does
    // not add to or replace the 10-minute polling interval.
    setTimeout(() => {
      refresh();
    }, 4000);
  };

  const handleIncidentDeleted = () => {
    setToastMessage("Incident deleted.");
    // Re-fetch immediately so both the recent incidents list and the
    // statistic cards (both "Last 10 Minutes" and "Overall") drop the
    // deleted record right away, with no page reload.
    refresh();
  };

  return (
    <>
      <Navbar />

      <main>
        <Hero onUploadClick={handleUploadClick} />

        <UploadArea sectionRef={uploadSectionRef} onUploadSuccess={handleUploadSuccess} />

        <StatisticsGrid
          recentStats={data?.recentStats}
          overallStats={data?.overallStats}
          isLoading={isLoading}
        />

        <IncidentGrid
          incidents={data?.incidents || data?.recentIncidents}
          isLoading={isLoading}
          error={isError ? error : null}
          onRetry={refresh}
          onOpenIncident={(incident) => setSelectedIncident(incident)}
        />
      </main>

      <Footer />

      <IncidentModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onDeleted={handleIncidentDeleted}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  );
}

export default Dashboard;
