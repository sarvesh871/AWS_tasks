# Lucid — AI Image Recognition

A modern, responsive React 19 + Vite dashboard for uploading images and
browsing AI recognition results (objects, detected text, confidence, and
generated audio summaries).

## Stack

- React 19 (functional components + hooks, no Redux, no Context API)
- Vite
- Plain modern CSS (no CSS framework/UI kit)
- Browser `fetch()` / `XMLHttpRequest` only — no AWS SDK, no Amplify

## Getting started

```bash
npm install
npm run dev
```

The app talks directly to:

```
https://hdr0ekq016.execute-api.ap-south-1.amazonaws.com
```

using the three endpoints below (see `src/services/api.js`):

- `POST /upload-url` — request a pre-signed upload URL, then `PUT` the file to it directly
- `GET /images` — list all recognized images
- `GET /image/{id}` — full detail for a single image

## Project structure

```
src/
  components/   Navbar, UploadCard, Gallery, ImageCard, DetailsModal,
                ObjectCard, LoadingSpinner, Toast, Tabs, AudioPlayer,
                ConfidenceRing (signature confidence gauge)
  hooks/        useTheme, useToast, useGallery
  services/     api.js — all backend calls
  utils/        format.js — date/confidence/grade helpers
  App.jsx       page composition
  main.jsx      entry point
```

## Notes

- Upload progress is reported via `XMLHttpRequest` (native `fetch` cannot
  report upload progress), then the pre-signed URL is `PUT` to directly from
  the browser.
- The file input uses `capture="environment"` so mobile browsers open the
  rear camera automatically.
- Theme preference is persisted to `localStorage` and respects the user's
  OS preference on first visit.
- Images lazy-load (`loading="lazy"`) and gallery cards are memoized to
  avoid unnecessary re-renders.
