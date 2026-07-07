import { ENDPOINTS } from "../config";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getExtension = (file) => {
  const nameParts = file.name.split(".");
  const ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : "";
  if (ext) return ext === "jpeg" ? "jpg" : ext;
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return mimeMap[file.type] || "jpg";
};

/**
 * Requests a pre-signed upload URL, then PUTs the file directly to it.
 * Returns the imageId so the caller can poll / display the new incident.
 */
export async function uploadIncident(file, { onProgress } = {}) {
  const extension = getExtension(file);

  const urlResponse = await fetch(ENDPOINTS.uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extension }),
  });

  if (!urlResponse.ok) {
    const body = await parseJsonSafely(urlResponse);
    throw new ApiError(
      (body && body.message) || "Could not prepare the upload. Please try again.",
      urlResponse.status
    );
  }

  const { imageId, objectKey, uploadUrl } = await urlResponse.json();

  if (!uploadUrl) {
    throw new ApiError("The server did not return an upload destination.", 500);
  }

  onProgress?.(20);

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || `image/${extension}` },
    body: file,
  });

  if (!putResponse.ok) {
    throw new ApiError("The image could not be uploaded. Please try again.", putResponse.status);
  }

  onProgress?.(100);

  return { imageId, objectKey };
}

export async function getDashboard() {
  const response = await fetch(ENDPOINTS.dashboard);

  if (!response.ok) {
    throw new ApiError("Could not load the dashboard. Please try again.", response.status);
  }

  return response.json();
}

export async function getIncident(imageId) {
  const response = await fetch(ENDPOINTS.incident(imageId));

  if (!response.ok) {
    throw new ApiError("Could not load this incident. Please try again.", response.status);
  }

  return response.json();
}

export async function deleteIncident(imageId) {
  const response = await fetch(
    ENDPOINTS.incident(imageId),
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Unable to delete incident.");
  }

  return response.json();

}

export { ApiError };
