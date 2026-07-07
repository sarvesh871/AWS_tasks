export const API_BASE = "https://5xrg4zi815.execute-api.ap-south-1.amazonaws.com";

export const ENDPOINTS = {
  uploadUrl: `${API_BASE}/upload-url`,
  dashboard: `${API_BASE}/dashboard`,
  incident: (imageId) => `${API_BASE}/incident/${imageId}`,
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

// Matches the backend's incident window: the dashboard is polled on this
// same cadence (10 minutes) so the "Last 10 Minutes" stats and the
// scheduled refresh never drift apart. Manual refreshes (post-upload,
// post-delete) happen independently of this timer.
export const AUTO_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export const CATEGORY_META = {
  pothole: { label: "Potholes", color: "#EF4444", glow: "rgba(239, 68, 68, 0.35)" },
  potholes: { label: "Potholes", color: "#EF4444", glow: "rgba(239, 68, 68, 0.35)" },
  traffic: { label: "Traffic", color: "#F97316", glow: "rgba(249, 115, 22, 0.35)" },
  garbage: { label: "Garbage", color: "#22C55E", glow: "rgba(34, 197, 94, 0.35)" },
  streetlight: { label: "Street Lights", color: "#EAB308", glow: "rgba(234, 179, 8, 0.35)" },
  street_light: { label: "Street Lights", color: "#EAB308", glow: "rgba(234, 179, 8, 0.35)" },
  streetlights: { label: "Street Lights", color: "#EAB308", glow: "rgba(234, 179, 8, 0.35)" },
  default: { label: "Other", color: "#3B82F6", glow: "rgba(59, 130, 246, 0.35)" },
};

export const getCategoryMeta = (category) => {
  if (!category) return CATEGORY_META.default;
  const key = category.toLowerCase().replace(/\s+/g, "_");
  return CATEGORY_META[key] || CATEGORY_META.default;
};
