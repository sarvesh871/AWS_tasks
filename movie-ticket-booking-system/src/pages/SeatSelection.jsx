import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { motion } from "framer-motion";
import { getShows, getSeats, bookSeat } from "../services/api.js";
import SeatGrid from "../components/SeatGrid.jsx";
import BookingPanel from "../components/BookingPanel.jsx";
import { SeatGridSkeleton } from "../components/LoadingSkeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";

/**
 * Seat selection + booking page for a single show.
 *
 * The backend exposes no "single show" endpoint, so the show's own
 * details (poster, price, theatre, time) are read from GET /shows
 * and matched by showId, while seat availability comes from
 * GET /seats?showId=...
 */
export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const loadData = async () => {
    setStatus("loading");
    try {
      const [showsRes, seatsRes] = await Promise.all([getShows(), getSeats(showId)]);

      const matchedShow = (showsRes?.data || []).find((s) => s.showId === showId);
      const seats = seatsRes?.data || [];
      const booked = seats.filter((seat) => !seat.available).map((seat) => seat.seatNumber);

      setShow(matchedShow || null);
      setBookedSeats(booked);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  const handleSelectSeat = (seatNumber) => {
    // Only one seat may be selected at a time — clicking the same
    // seat again deselects it, clicking another replaces the choice.
    setSelectedSeat((prev) => (prev === seatNumber ? null : seatNumber));
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    if (!selectedSeat || !name.trim() || !email.trim()) return;

    if (!isValidEmail(email.trim())) {
      setSnackbar({ open: true, message: "Please enter a valid email address.", severity: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookSeat({
        showId,
        seatNumber: selectedSeat,
        customerName: name.trim(),
        customerEmail: email.trim(),
      });

      if (res?.success) {
        setSuccessOpen(true);
      } else {
        throw new Error(res?.message || "Booking could not be completed.");
      }
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message || "That seat may have just been taken. Please pick another.";
      setSnackbar({ open: true, message, severity: "error" });
      // Refresh seat map in case the seat was taken by someone else
      loadData();
      setSelectedSeat(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOpen(false);
    navigate("/");
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate("/")}
        sx={{ color: "text.secondary", mb: 3 }}
      >
        Back to movies
      </Button>

      {status === "loading" && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <SeatGridSkeleton />
          </Grid>
        </Grid>
      )}

      {status === "error" && <ErrorState subtitle="We couldn't load this show. Please try again." onRetry={loadData} />}

      {status === "success" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {show && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {show.movieName}
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {show.theatre} · {show.date} · {show.time}
              </Typography>
            </Box>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  p: { xs: 2, md: 4 },
                  bgcolor: "#111319",
                }}
              >
                <SeatGrid bookedSeats={bookedSeats} selectedSeat={selectedSeat} onSelect={handleSelectSeat} />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <BookingPanel
                show={show}
                selectedSeat={selectedSeat}
                name={name}
                email={email}
                onNameChange={setName}
                onEmailChange={setEmail}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Booking success dialog */}
      <Dialog
        open={successOpen}
        onClose={handleCloseSuccess}
        PaperProps={{
          sx: { borderRadius: "20px", p: 1, bgcolor: "#161923", border: "1px solid rgba(255,255,255,0.08)" },
        }}
      >
        <DialogContent sx={{ textAlign: "center", py: 5, px: 4 }}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          </motion.div>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Booking Successful
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Seat {selectedSeat} is yours for {show?.movieName}. A confirmation has been
            sent to {email}.
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={handleCloseSuccess}>
            Back to Movies
          </Button>
        </DialogContent>
      </Dialog>

      {/* Error / warning feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
