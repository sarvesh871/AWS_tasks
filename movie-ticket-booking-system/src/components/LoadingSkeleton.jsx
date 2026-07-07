import { Box, Skeleton, Grid } from "@mui/material";

/**
 * Skeleton placeholders shown while movies/shows are loading.
 * "count" controls how many card placeholders render.
 */
export function MovieCardSkeleton({ count = 8 }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <Box sx={{ borderRadius: "18px", overflow: "hidden", bgcolor: "#161923", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Skeleton variant="rectangular" height={340} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
            <Box sx={{ p: 2 }}>
              <Skeleton width="80%" height={28} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
              <Skeleton width="55%" height={20} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
              <Skeleton width="70%" height={20} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
              <Skeleton variant="rounded" height={42} sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.08)" }} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

/** Skeleton for the seat grid while seat availability loads. */
export function SeatGridSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center", py: 4 }}>
      {Array.from({ length: 5 }).map((_, r) => (
        <Box key={r} sx={{ display: "flex", gap: 1 }}>
          {Array.from({ length: 10 }).map((_, c) => (
            <Skeleton
              key={c}
              variant="rounded"
              width={26}
              height={26}
              sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

/** Skeleton for booking history cards. */
export function BookingCardSkeleton({ count = 3 }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={92}
          sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "16px" }}
        />
      ))}
    </Box>
  );
}
