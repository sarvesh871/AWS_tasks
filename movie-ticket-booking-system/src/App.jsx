import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import SeatSelection from "./pages/SeatSelection.jsx";
import BookingHistory from "./pages/BookingHistory.jsx";

/**
 * Top-level route map.
 *  /             -> movie listing
 *  /movie/:showId -> seat selection + booking
 *  /history       -> booking history search
 */
export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:showId" element={<SeatSelection />} />
          <Route path="/history" element={<BookingHistory />} />
        </Routes>
      </Box>
    </Box>
  );
}
