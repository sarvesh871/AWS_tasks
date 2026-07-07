import { Box, Typography, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { tokens } from "../theme.js";

const ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 10;

/**
 * Renders the fixed 5 x 10 (50-seat) auditorium layout.
 *
 * Seat state is derived entirely from props:
 * - bookedSeats: seat numbers already taken (red, disabled)
 * - selectedSeat: the single seat the user has chosen (blue)
 * - everything else is available (green)
 */
export default function SeatGrid({ bookedSeats, selectedSeat, onSelect }) {
  const getSeatState = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return "booked";
    if (selectedSeat === seatNumber) return "selected";
    return "available";
  };

  const seatColor = {
    available: tokens.green,
    booked: tokens.accent,
    selected: tokens.blue,
  };

  return (
    <Box>
      {/* Screen indicator */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Box
          sx={{
            width: "80%",
            maxWidth: 420,
            height: 6,
            mx: "auto",
            borderRadius: "50%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            boxShadow: "0 10px 30px rgba(255,255,255,0.12)",
          }}
        />
        <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: "0.2em", mt: 1, display: "block" }}>
          SCREEN
        </Typography>
      </Box>

      {/* Rows A - E */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center" }}>
        {ROWS.map((row) => (
          <Box key={row} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Typography
              className="mono-data"
              sx={{ width: 20, color: "text.secondary", fontWeight: 700, textAlign: "center" }}
            >
              {row}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                const seatNumber = `${row}${i + 1}`;
                const state = getSeatState(seatNumber);
                const isBooked = state === "booked";

                return (
                  <Tooltip key={seatNumber} title={`${seatNumber} · ${state}`} arrow>
                    <Box
                      component={motion.button}
                      whileHover={!isBooked ? { scale: 1.12 } : {}}
                      whileTap={!isBooked ? { scale: 0.94 } : {}}
                      onClick={() => !isBooked && onSelect(seatNumber)}
                      disabled={isBooked}
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "7px 7px 3px 3px",
                        border: "none",
                        cursor: isBooked ? "not-allowed" : "pointer",
                        backgroundColor: seatColor[state],
                        opacity: isBooked ? 0.35 : 1,
                        boxShadow:
                          state === "selected"
                            ? `0 0 0 3px rgba(61,139,253,0.35)`
                            : "none",
                        transition: "box-shadow 0.2s ease",
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>

            {/* Mirror row label on the right for symmetry */}
            <Typography
              className="mono-data"
              sx={{ width: 20, color: "text.secondary", fontWeight: 700, textAlign: "center" }}
            >
              {row}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 5, flexWrap: "wrap" }}>
        {[
          { label: "Available", color: tokens.green },
          { label: "Selected", color: tokens.blue },
          { label: "Booked", color: tokens.accent, faded: true },
        ].map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "5px 5px 2px 2px",
                backgroundColor: item.color,
                opacity: item.faded ? 0.35 : 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
