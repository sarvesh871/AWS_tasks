import { Box, Typography, TextField, Button, Divider } from "@mui/material";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import { tokens } from "../theme.js";

/**
 * The sticky "ticket stub" summary + booking form shown alongside the
 * seat grid. Deliberately styled like a physical ticket: a perforated
 * top edge, monospace seat/price data, and a single confirm action.
 */
export default function BookingPanel({
  show,
  selectedSeat,
  name,
  email,
  onNameChange,
  onEmailChange,
  onSubmit,
  submitting,
}) {
  const canSubmit = Boolean(selectedSeat) && name.trim() && email.trim();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 96,
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "#161923",
      }}
    >
      {/* Ticket header block */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #f8395a, #c81e3c)",
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <ConfirmationNumberRoundedIcon sx={{ color: "#fff" }} />
        <Typography variant="h6" sx={{ color: "#fff" }}>
          Your Ticket
        </Typography>
      </Box>

      <Box className="ticket-edge" sx={{ "--edge-color": "#161923", p: 3 }}>
        {show ? (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
              {show.movieName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              {show.theatre}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Date
              </Typography>
              <Typography variant="body2" className="mono-data">
                {show.date}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Time
              </Typography>
              <Typography variant="body2" className="mono-data">
                {show.time}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Seat
              </Typography>
              <Typography
                variant="body2"
                className="mono-data"
                sx={{ color: selectedSeat ? tokens.blue : "text.secondary", fontWeight: 700 }}
              >
                {selectedSeat || "Not selected"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Price
              </Typography>
              <Typography variant="body2" className="mono-data" sx={{ fontWeight: 700 }}>
                ₹{show.price}
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: "dashed", mb: 2.5 }} />

            <TextField
              label="Your name"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Your email"
              type="email"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={!canSubmit || submitting}
              onClick={onSubmit}
              sx={{ py: 1.3 }}
            >
              {submitting ? "Booking…" : "Book Ticket"}
            </Button>

            {!selectedSeat && (
              <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1.5, color: "text.secondary" }}>
                Pick a seat from the map to continue.
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Loading show details…
          </Typography>
        )}
      </Box>
    </Box>
  );
}
