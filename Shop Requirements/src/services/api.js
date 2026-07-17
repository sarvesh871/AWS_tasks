// Central place for the API base URL and every network call the app makes.
// No component should call fetch() directly — everything routes through here.

const BASE_URL = "https://vj4czkp3r7.execute-api.ap-south-1.amazonaws.com";

const API_KEY = "shop-requirements-secret-2026";

const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
};

/**
 * Parses a fetch Response, throwing a readable Error for non-2xx responses.
 */
async function handleResponse(response) {
  let data = null
  try {
    data = await response.json()
  } catch (err) {
    // Response had no JSON body — fall through with data = null.
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

/**
 * POST /requirements
 * Submits a new shop requirement.
 */
export async function submitRequirement({ shopName, item, quantity }) {
  const response = await fetch(`${BASE_URL}/requirements`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ shopName, item, quantity }),
  })
  return handleResponse(response)
}

/**
 * GET /dashboard
 * Fetches meta totals, the requirement list, and the per-item summary.
 */
export async function getDashboard() {
  const response = await fetch(`${BASE_URL}/dashboard`, {
    method: 'GET',
    headers: DEFAULT_HEADERS
  })
  return handleResponse(response)
}

/**
 * POST /send-summary
 * Triggers a summary notification to the manager. No request body.
 */
export async function sendSummary() {
  const response = await fetch(`${BASE_URL}/send-summary`, {
    method: 'POST',
    headers: DEFAULT_HEADERS
  })
  return handleResponse(response)
}

export default {
  submitRequirement,
  getDashboard,
  sendSummary,
}
