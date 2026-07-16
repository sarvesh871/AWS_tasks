import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { requestUploadUrl, uploadFileToS3 } from '../services/api';
import type { UploadItem } from '../types';
import { generateClientId, validateImageFile } from '../utils/validation';

interface UseUploadResult {
  uploads: UploadItem[];
  addFiles: (files: File[]) => void;
  cancelUpload: (id: string) => void;
  dismissUpload: (id: string) => void;
  clearCompleted: () => void;
}

export function useUpload(onUploadComplete: () => void): UseUploadResult {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const cancelHandlers = useRef<Map<string, () => void>>(new Map());

  const updateUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  const startUpload = useCallback(
    async (item: UploadItem) => {
      updateUpload(item.id, { status: 'uploading', progress: 0 });

      try {
        const { uploadUrl, imageId } = await requestUploadUrl({
          fileName: item.file.name,
          contentType: item.file.type,
        });
        void imageId;

        const { promise, cancel } = uploadFileToS3(uploadUrl, item.file, {
          onProgress: (percent) => updateUpload(item.id, { progress: percent }),
        });

        cancelHandlers.current.set(item.id, cancel);
        await promise;

        updateUpload(item.id, { status: 'success', progress: 100 });
        toast.success(`${item.file.name} uploaded successfully`);
        onUploadComplete();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed.';
        const wasCancelled = message.toLowerCase().includes('cancelled');
        updateUpload(item.id, {
          status: wasCancelled ? 'cancelled' : 'error',
          error: wasCancelled ? undefined : message,
        });
        if (!wasCancelled) {
          toast.error(`${item.file.name}: ${message}`);
        }
      } finally {
        cancelHandlers.current.delete(item.id);
      }
    },
    [onUploadComplete, updateUpload]
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const validItems: UploadItem[] = [];

      for (const file of files) {
        const result = validateImageFile(file);
        if (!result.valid) {
          toast.error(result.error ?? 'Invalid file.');
          continue;
        }
        validItems.push({
          id: generateClientId(),
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: 'pending',
        });
      }

      if (validItems.length === 0) return;

      setUploads((current) => [...validItems, ...current]);
      for (const item of validItems) {
        void startUpload(item);
      }
    },
    [startUpload]
  );

  const cancelUpload = useCallback(
    (id: string) => {
      const cancel = cancelHandlers.current.get(id);
      if (cancel) {
        cancel();
      } else {
        updateUpload(id, { status: 'cancelled' });
      }
    },
    [updateUpload]
  );

  const dismissUpload = useCallback((id: string) => {
    setUploads((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((current) => {
      current
        .filter((item) => item.status === 'success' || item.status === 'cancelled')
        .forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return current.filter((item) => item.status !== 'success' && item.status !== 'cancelled');
    });
  }, []);

  return { uploads, addFiles, cancelUpload, dismissUpload, clearCompleted };
}
