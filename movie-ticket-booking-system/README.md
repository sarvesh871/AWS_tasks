# CineStub — Movie Ticket Booking System

A React + Vite frontend for booking movie tickets, built against a live
AWS API Gateway backend.

## Stack

- React 18 (functional components + hooks)
- Vite
- Material UI (MUI) — dark theme, red accents
- Axios (all calls centralized in `src/services/api.js`)
- React Router v6
- Framer Motion

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Project structure

```
src/
  components/   # Navbar, MovieCard, SeatGrid, BookingPanel, skeletons, empty/error states
  pages/         # Home, SeatSelection, BookingHistory
  services/      # api.js — every axios call lives here
  theme.js       # MUI dark theme + design tokens
  App.jsx        # route definitions
  main.jsx       # app entry point
```

## Routes

| Path             | Page            |
| ---------------- | --------------- |
| `/`               | Movie listing   |
| `/movie/:showId`  | Seat selection  |
| `/history`        | Booking history |

## API

All requests are built from a single constant in `src/services/api.js`:

```js
const API_BASE = "https://clwbzzgx08.execute-api.ap-south-1.amazonaws.com/dev";
```

Endpoints used: `GET /shows`, `GET /seats?showId=`, `POST /book`,
`GET /booking?email=`.
