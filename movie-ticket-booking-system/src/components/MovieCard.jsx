import { Card, CardMedia, CardContent, Typography, Button, Box, Chip } from "@mui/material";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MotionCard = motion(Card);

/**
 * A single show tile on the home page. Shows the poster plus the
 * essentials a moviegoer scans first: name, venue, date, time, price.
 */
export default function MovieCard({ show }) {
  const navigate = useNavigate();

  return (
    <MotionCard
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      sx={{
        backgroundColor: "surface.main",
        bgcolor: "#161923",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={show.poster}
          alt={show.movieName}
          sx={{ height: 340, objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(10,11,15,0.9) 0%, transparent 55%)",
          }}
        />
        <Chip
          label={`₹${show.price}`}
          className="mono-data"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(10,11,15,0.75)",
            color: "#fff",
            fontWeight: 700,
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />
      </Box>

      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
        <Typography variant="h6" noWrap title={show.movieName}>
          {show.movieName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
          <PlaceRoundedIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">{show.theatre}</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "text.secondary" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <EventRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" className="mono-data">
              {show.date}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ScheduleRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" className="mono-data">
              {show.time}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: "auto", pt: 1.2, pb: 1.2 }}
          onClick={() => navigate(`/movie/${show.showId}`)}
        >
          Book Now
        </Button>
      </CardContent>
    </MotionCard>
  );
}
