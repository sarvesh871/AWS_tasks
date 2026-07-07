import { createTheme } from "@mui/material/styles";

/**
 * Design tokens for the app.
 *
 * Palette: near-black ground with a single hot-pink/red signature
 * accent (the "CineStub" red), a cool blue for "selected" states,
 * and a green for "available" states — mirrors a real ticket booth's
 * traffic-light seat map.
 *
 * Type system: Poppins carries headlines and brand voice, Inter
 * carries body copy and UI chrome, JetBrains Mono is reserved for
 * ticket-like data — seat codes, showtimes, prices — so numbers read
 * like they were printed on an actual stub.
 */
export const tokens = {
  bg: "#0a0b0f",
  bgElevated: "#111319",
  surface: "#161923",
  surfaceAlt: "#1c202c",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",

  accent: "#f8395a", // signature red
  accentDark: "#c81e3c",
  accentSoft: "rgba(248,57,90,0.14)",

  blue: "#3d8bfd", // selected seat
  blueSoft: "rgba(61,139,253,0.14)",

  green: "#29c46f", // available seat
  greenSoft: "rgba(41,196,111,0.14)",

  textPrimary: "#f4f5f7",
  textSecondary: "#9aa0b0",
  textFaint: "#5c6170",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: tokens.accent,
      dark: tokens.accentDark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: tokens.blue,
      contrastText: "#ffffff",
    },
    success: {
      main: tokens.green,
    },
    background: {
      default: tokens.bg,
      paper: tokens.surface,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
    },
    divider: tokens.border,
  },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Poppins", sans-serif', fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.bg,
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(248,57,90,0.10), transparent 40%), radial-gradient(circle at 85% 10%, rgba(61,139,253,0.08), transparent 45%)",
          backgroundAttachment: "fixed",
          scrollbarColor: `${tokens.surfaceAlt} ${tokens.bg}`,
        },
        "*::-webkit-scrollbar": { width: 10, height: 10 },
        "*::-webkit-scrollbar-track": { background: tokens.bg },
        "*::-webkit-scrollbar-thumb": {
          background: tokens.surfaceAlt,
          borderRadius: 8,
          border: `2px solid ${tokens.bg}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 20,
          paddingRight: 20,
        },
        containedPrimary: {
          boxShadow: "0 12px 28px rgba(248,57,90,0.28)",
          "&:hover": {
            boxShadow: "0 16px 34px rgba(248,57,90,0.4)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
