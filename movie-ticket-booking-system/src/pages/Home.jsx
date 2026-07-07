import { useEffect, useState } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import { getShows } from "../services/api.js";
import MovieCard from "../components/MovieCard.jsx";
import { MovieCardSkeleton } from "../components/LoadingSkeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";

/**
 * Landing page: hero banner + grid of every show pulled from GET /shows.
 */
export default function Home() {
  const [shows, setShows] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error

  const loadShows = async () => {
    setStatus("loading");
    try {
      const res = await getShows();
      setShows(res?.data || []);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadShows();
  }, []);

  return (
    <Box>
      {/* ---------------- HERO ---------------- */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 999,
                bgcolor: "rgba(248,57,90,0.12)",
                color: "primary.main",
                mb: 3,
              }}
            >
              <LocalActivityRoundedIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Now booking — every seat, live
              </Typography>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.4rem", md: "3.6rem" },
                maxWidth: 720,
                lineHeight: 1.08,
                mb: 2,
              }}
            >
              Grab your seat before the lights go down.
            </Typography>

            <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 520, fontSize: "1.05rem" }}>
              Browse everything showing right now, pick your favourite seat on
              a live map, and lock it in — no queues, no waiting for a
              confirmation call.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* ---------------- MOVIE GRID ---------------- */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          In theatres now
        </Typography>

        {status === "loading" && <MovieCardSkeleton count={8} />}

        {status === "error" && <ErrorState subtitle="We couldn't load the shows. Please try again." onRetry={loadShows} />}

        {status === "success" && shows.length === 0 && (
          <EmptyState
            icon={LocalActivityRoundedIcon}
            title="No shows scheduled"
            subtitle="Check back soon — new shows are added regularly."
          />
        )}

        {status === "success" && shows.length > 0 && (
          <Grid container spacing={3}>
            {shows.map((show, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={show.showId || index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  style={{ height: "100%" }}
                >
                  <MovieCard show={show} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
