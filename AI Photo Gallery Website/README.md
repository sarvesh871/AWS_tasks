# Lumen — AI Image Gallery

A premium, production-quality frontend for an AI-powered image gallery. Drop in
photos, watch them upload directly to S3 via pre-signed URLs, and browse a
searchable grid of images with automatically detected labels and confidence
scores.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tooling
- **Tailwind CSS** — styling, with a custom dark/light design system
- **Framer Motion** — animation
- **React Dropzone** — drag & drop uploads
- **Lucide React** — icons
- **React Hot Toast** — notifications

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

To build for production:

```bash
npm run build
npm run preview
```

## Backend

This app talks directly to a REST API — no authentication layer is used.

Base URL: `https://o0cxj2pa10.execute-api.ap-south-1.amazonaws.com`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/upload-url` | Request a pre-signed S3 upload URL |
| `PUT`  | *(the returned `uploadUrl`)* | Upload the file directly to S3 |
| `GET`  | `/gallery` | List all images |
| `GET`  | `/gallery?search=query` | Server-side label search |
| `DELETE` | `/image/{imageId}` | Delete an image |

Images are **never** proxied through the API — files are uploaded directly to
S3 using the pre-signed URL, tracked with real upload progress via
`XMLHttpRequest`.

## Project Structure

```
src/
├── components/     UI components (Navbar, Hero, Gallery, ImageModal, ...)
├── hooks/          useGallery, useUpload, useDebounce, useTheme
├── services/       API client (api.ts)
├── types/          Shared TypeScript interfaces
├── utils/          Formatting & validation helpers
├── App.tsx         Composition root
├── main.tsx        Entry point
└── index.css       Design tokens & global styles
```

## Features

- Drag-and-drop or browse-to-upload, with per-file progress bars and cancel
- Client-side validation (image type, 10 MB max) before requesting an upload URL
- Debounced (300ms) server-side search against `/gallery?search=`
- Responsive grid: 1 column on mobile, 2 on tablet, 4 on desktop
- Full-screen image modal with all metadata and per-label confidence bars
- Delete flow with a confirmation dialog, optimistic UI removal, and toasts
- Skeleton loading states and an empty-state illustration
- Light/dark theme toggle persisted to `localStorage`
- Keyboard (Esc) and outside-click modal dismissal, focus-visible states,
  semantic landmarks and ARIA labels throughout

## Notes

- There is no authentication layer by design — no login, no tokens, no
  Cognito. Requests are sent to the API exactly as documented.
- `npm run build` type-checks the project (`tsc -b`) before bundling, so any
  type errors will fail the build.
