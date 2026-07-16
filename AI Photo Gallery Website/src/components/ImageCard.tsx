import { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag } from 'lucide-react';
import type { GalleryImage } from '../types';
import { formatRelativeTime, truncateFileName } from '../utils/format';

interface ImageCardProps {
  image: GalleryImage;
  onClick: (image: GalleryImage) => void;
  index: number;
}

function ImageCardBase({ image, onClick, index }: ImageCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick(image)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
      className="group glass relative overflow-hidden rounded-2xl text-left shadow-card focus-visible:shadow-glow-sm"
      aria-label={`View details for ${image.fileName}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]">
        <img
          src={image.imageUrl}
          alt={image.topLabel ? `${image.topLabel} — ${image.fileName}` : image.fileName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {image.topLabel && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Tag className="h-3 w-3 text-accent-cyan" aria-hidden="true" />
            {image.topLabel}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="truncate text-sm font-semibold text-white">
            {truncateFileName(image.fileName)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {formatRelativeTime(image.uploadedAt)}
          </div>
        </div>
      </div>

      <div className="p-3.5 group-hover:hidden">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
          {truncateFileName(image.fileName)}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="truncate text-xs text-slate-500 dark:text-slate-400">
            {image.topLabel || 'Unlabeled'}
          </span>
          <span className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-500">
            {formatRelativeTime(image.uploadedAt)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export const ImageCard = memo(ImageCardBase);
