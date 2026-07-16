export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: `"${file.name}" is not a supported image file.` };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported format. Use JPG, PNG, GIF, WEBP, or HEIC.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `"${file.name}" exceeds the 10 MB size limit.` };
  }

  return { valid: true };
}

export function generateClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
