export interface ImageLabel {
  name: string;
  confidence: number;
}

export interface GalleryImage {
  imageId: string;
  fileName: string;
  imageUrl: string;
  uploadedAt: string;
  topLabel: string;
  labelCount: number;
  labels: ImageLabel[];
  size: number;
  contentType: string;
}

export interface UploadUrlRequest {
  fileName: string;
  contentType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  imageId: string;
  objectKey: string;
}

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export type Theme = 'dark' | 'light';
