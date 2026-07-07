import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Chip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { motion } from "framer-motion";
import { getBookingHistory } from "../services/api.js";
import { BookingCardSkeleton } from "../components/LoadingSkeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";

/**
 * Lets a customer look up every ticket booked under their email.
 * Nothing loads until a search is run — history is scoped per email,
 * not a global list.
 */
export default function BookingHistory() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [searchedEmail, setSearchedEmail] = useState("");

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSearch = async () => {
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    setSearchedEmail(trimmed);

    try {
      const res = await getBookingHistory(trimmed);
      setBookings(res?.data || []);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <HistoryRoundedIcon sx={{ color: "primary.main" }} />
        <Typography variant="h4">My Bookings</Typography>
      </Box>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
        Enter the email you booked with to see every ticket tied to it.
      </Typography>

      {/* Search bar */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          p: 1,
          mb: 4,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          bgcolor: "#161923",
        }}
      >
        <TextField
          fullWidth
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { px: 1.5, py: 1 } }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchRoundedIcon />}
          onClick={handleSearch}
          sx={{ px: 3 }}
        >
          Search
        </Button>
      </Box>

      {status === "idle" && (
        <EmptyState
          icon={ConfirmationNumberRoundedIcon}
          title="Search to see your tickets"
          subtitle="Your booking history will appear here once you search."
        />
      )}

      {status === "loading" && <BookingCardSkeleton count={3} />}

      {status === "error" && !isValidEmail(email.trim() || "x") && (
        <ErrorState
          title="Enter a valid email"
          subtitle="Please type a full email address, then search again."
          onRetry={handleSearch}
        />
      )}

      {status === "error" && isValidEmail(email.trim() || "") && (
        <ErrorState
          title="Couldn't load bookings"
          subtitle="Something went wrong while fetching your history."
          onRetry={handleSearch}
        />
      )}

      {status === "success" && bookings.length === 0 && (
        <EmptyState
          icon={ConfirmationNumberRoundedIcon}
          title="No bookings found"
          subtitle={`We couldn't find any tickets booked with ${searchedEmail}.`}
        />
      )}

      {status === "success" && bookings.length > 0 && (
        <Grid container spacing={2}>
          {bookings.map((booking, index) => (
            <Grid item xs={12} key={booking.bookingId || index}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Box
                  className="ticket-edge"
                  sx={{
                    "--edge-color": "#0a0b0f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    p: 3,
                    bgcolor: "#161923",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(248,57,90,0.12)",
                        flexShrink: 0,
                      }}
                    >
                      <ConfirmationNumberRoundedIcon sx={{ color: "primary.main" }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {booking.movieName || booking.showId}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {booking.theatre ? `${booking.theatre} · ` : ""}
                        {booking.date} {booking.time ? `· ${booking.time}` : ""}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={`Seat ${booking.seatNumber}`}
                    className="mono-data"
                    sx={{
                      bgcolor: "rgba(61,139,253,0.14)",
                      color: "#3d8bfd",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
