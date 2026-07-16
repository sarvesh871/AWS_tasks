import { memo } from 'react';
import type { GalleryImage } from '../types';
import { ImageCard } from './ImageCard';
import { SkeletonCard } from './SkeletonCard';
import { EmptyState } from './EmptyState';

interface GalleryProps {
  images: GalleryImage[];
  isLoading: boolean;
  searchTerm: string;
  onImageClick: (image: GalleryImage) => void;
}

function GalleryBase({ images, isLoading, searchTerm, onImageClick }: GalleryProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : images.length === 0 ? (
        searchTerm ? (
          <EmptyState variant="no-results" searchTerm={searchTerm} />
        ) : (
          <EmptyState variant="empty" />
        )
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image, index) => (
            <ImageCard key={image.imageId} image={image} onClick={onImageClick} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

export const Gallery = memo(GalleryBase);
