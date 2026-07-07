# Smart City Incident Reporting System

A frontend-only React (Vite + JavaScript) dashboard for reporting and monitoring city
incidents — potholes, traffic hazards, garbage overflow, and street light faults —
classified automatically by an AI backend (Amazon Rekognition).

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and talks directly to the hosted REST API
configured in `src/config.js` — no backend setup or environment variables required.

## Project structure

```
src/
  components/   Reusable UI components (Navbar, Hero, UploadArea, StatCard, IncidentCard, ...)
  pages/        Dashboard.jsx — composes the full page
  services/     api.js — fetch-based API client (upload-url, dashboard, incident)
  hooks/        useDashboard, useCountUp, useClock, useLockBodyScroll
  styles/       Per-component CSS + global theme tokens
  config.js     Hardcoded API base URL, category metadata, constants
```

## How uploads work

1. `POST /upload-url` with `{ extension }` → receives `{ imageId, objectKey, uploadUrl }`.
2. The image is `PUT` directly to the returned pre-signed `uploadUrl` using `fetch()`.
3. On success, a toast confirms the upload and the dashboard auto-refreshes after 4 seconds.

The dashboard also polls `GET /dashboard` every 30 seconds, so no manual page refresh is
ever required.
