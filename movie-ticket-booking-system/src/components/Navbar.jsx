import { AppBar, Toolbar, Box, Typography, Button, Container } from "@mui/material";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Link, useLocation } from "react-router-dom";

/**
 * Sticky top navigation. Highlights the active route and keeps the
 * brand mark + primary destinations reachable from every page.
 */
export default function Navbar() {
  const { pathname } = useLocation();

  const navItem = (to, label, icon) => (
    <Button
      component={Link}
      to={to}
      startIcon={icon}
      sx={{
        color: pathname === to ? "primary.main" : "text.secondary",
        fontWeight: 600,
        "&:hover": { color: "primary.main", backgroundColor: "rgba(248,57,90,0.08)" },
      }}
    >
      {label}
    </Button>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(10,11,15,0.75)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1, gap: 2 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              mr: "auto",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #f8395a, #c81e3c)",
                boxShadow: "0 8px 20px rgba(248,57,90,0.35)",
              }}
            >
              <LocalActivityRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ color: "text.primary", letterSpacing: "-0.01em" }}>
              CineStub
            </Typography>
          </Box>

          {navItem("/", "Movies", <LocalActivityRoundedIcon fontSize="small" />)}
          {navItem("/history", "My Bookings", <HistoryRoundedIcon fontSize="small" />)}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
