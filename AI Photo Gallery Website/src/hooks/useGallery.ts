import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { deleteImage, fetchGallery } from '../services/api';
import type { GalleryImage } from '../types';

interface UseGalleryResult {
  images: GalleryImage[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  removeImage: (imageId: string) => Promise<boolean>;
}

export function useGallery(searchQuery: string): UseGalleryResult {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async (query: string, isManualRefresh: boolean) => {
    const currentRequestId = ++requestIdRef.current;
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchGallery(query);
      if (currentRequestId === requestIdRef.current) {
        setImages(data);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to load gallery.';
        setError(message);
        toast.error(message);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(searchQuery, false);
  }, [searchQuery, load]);

  const refresh = useCallback(async () => {
    await load(searchQuery, true);
  }, [load, searchQuery]);

  const removeImage = useCallback(async (imageId: string): Promise<boolean> => {
    const previous = images;
    setImages((current) => current.filter((image) => image.imageId !== imageId));

    try {
      await deleteImage(imageId);
      toast.success('Image deleted');
      return true;
    } catch (err) {
      setImages(previous);
      const message = err instanceof Error ? err.message : 'Failed to delete image.';
      toast.error(message);
      return false;
    }
  }, [images]);

  return { images, isLoading, isRefreshing, error, refresh, removeImage };
}
