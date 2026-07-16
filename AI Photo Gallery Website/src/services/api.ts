import type { GalleryImage, UploadUrlRequest, UploadUrlResponse } from '../types';

const API_BASE_URL = 'https://o0cxj2pa10.execute-api.ap-south-1.amazonaws.com';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function fetchGallery(search?: string): Promise<GalleryImage[]> {
  const url = new URL(`${API_BASE_URL}/gallery`);
  if (search && search.trim()) {
    url.searchParams.set('search', search.trim());
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), { method: 'GET' });
  } catch {
    throw new ApiError('Unable to reach the gallery service. Check your connection.');
  }

  if (!response.ok) {
    throw new ApiError(`Failed to load gallery (${response.status})`, response.status);
  }

  const data = await parseJsonSafely(response);
  if (!Array.isArray(data)) {
    throw new ApiError('Gallery service returned an unexpected response.');
  }

  return data as GalleryImage[];
}

export async function requestUploadUrl(payload: UploadUrlRequest): Promise<UploadUrlResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError('Unable to reach the upload service. Check your connection.');
  }

  if (!response.ok) {
    throw new ApiError(`Failed to get an upload URL (${response.status})`, response.status);
  }

  const data = await parseJsonSafely(response);
  if (!data || typeof data !== 'object' || !('uploadUrl' in data)) {
    throw new ApiError('Upload service returned an unexpected response.');
  }

  return data as UploadUrlResponse;
}

interface UploadToS3Options {
  onProgress?: (percent: number) => void;
}

export function uploadFileToS3(
  uploadUrl: string,
  file: File,
  options: UploadToS3Options = {}
): { promise: Promise<void>; cancel: () => void } {
  const xhr = new XMLHttpRequest();
  console.log(file.type);
  const promise = new Promise<void>((resolve, reject) => {
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else if (xhr.status === 403) {
        reject(new ApiError('The upload link expired. Please try uploading again.', 403));
      } else {
        reject(new ApiError(`Upload failed (${xhr.status})`, xhr.status));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError('Network error while uploading. Please try again.'));
    };

    xhr.onabort = () => {
      reject(new ApiError('Upload cancelled.'));
    };

    xhr.send(file);
  });

  return {
    promise,
    cancel: () => xhr.abort(),
  };
}

export async function deleteImage(imageId: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/image/${encodeURIComponent(imageId)}`, {
      method: 'DELETE',
    });
  } catch {
    throw new ApiError('Unable to reach the server to delete this image.');
  }

  if (!response.ok) {
    throw new ApiError(`Failed to delete image (${response.status})`, response.status);
  }
}
