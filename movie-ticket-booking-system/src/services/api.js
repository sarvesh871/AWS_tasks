import axios from "axios";

/**
 * Single source of truth for the backend origin. Every request in the
 * app is built from this constant — never hardcode the URL elsewhere.
 */
export const API_BASE = "https://clwbzzgx08.execute-api.ap-south-1.amazonaws.com/dev";

/**
 * Shared axios instance. Components never call axios directly —
 * everything routes through the functions exported below so request
 * shape, error handling, and the base URL stay in one place.
 */
const client = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * GET /shows
 * Fetches every show currently on offer (movie + theatre + slot + price).
 */
export async function getShows() {
  const res = await client.get("/shows");
  return res.data;
}

/**
 * GET /seats?showId=SHOW101
 * Fetches the seat map (availability per seat) for a single show.
 */
export async function getSeats(showId) {
  const res = await client.get("/seats", { params: { showId } });
  return res.data;
}

/**
 * POST /book
 * Books exactly one seat for one customer against one show.
 */
export async function bookSeat({ showId, seatNumber, customerName, customerEmail }) {
  const res = await client.post("/book", {
    showId,
    seatNumber,
    customerName,
    customerEmail,
  });
  return res.data;
}

/**
 * GET /booking?email=john@gmail.com
 * Fetches the full booking history for a given customer email.
 */
export async function getBookingHistory(email) {
  const res = await client.get("/booking", { params: { email } });
  return res.data;
}

export default client;
