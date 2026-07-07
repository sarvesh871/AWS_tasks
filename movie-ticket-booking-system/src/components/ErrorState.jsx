import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

/**
 * Generic error state with a retry action. Used whenever an API
 * call fails so the failure is explained in plain terms with a way
 * forward, rather than a silent blank screen.
 */
export default function ErrorState({
  title = "Something went wrong",
  subtitle = "We couldn't reach the server. Please try again.",
  onRetry,
}) {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(248,57,90,0.1)",
        }}
      >
        <ErrorOutlineRoundedIcon sx={{ fontSize: 32, color: "primary.main" }} />
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        {subtitle}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" startIcon={<RefreshRoundedIcon />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </Box>
  );
}
