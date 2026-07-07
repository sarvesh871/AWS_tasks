import { Box, Typography } from "@mui/material";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";

/**
 * Generic "nothing here yet" state. Reused across the movie grid,
 * seat map, and booking history whenever the API returns no data.
 */
export default function EmptyState({
  icon,
  title = "Nothing here yet",
  subtitle = "Check back a little later.",
}) {
  const Icon = icon || SentimentDissatisfiedRoundedIcon;

  return (
    <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(255,255,255,0.05)",
        }}
      >
        <Icon sx={{ fontSize: 32, color: "text.secondary" }} />
      </Box>
      <Typography variant="h6" sx={{ color: "text.primary", mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2">{subtitle}</Typography>
    </Box>
  );
}
