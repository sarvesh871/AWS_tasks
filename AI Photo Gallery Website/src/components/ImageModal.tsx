import { memo, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Calendar, HardDrive, FileType, Tags } from 'lucide-react';
import type { GalleryImage } from '../types';
import { formatBytes, formatDate, confidenceColor } from '../utils/format';
import { ConfirmDialog } from './ConfirmDialog';

interface ImageModalProps {
  image: GalleryImage | null;
  onClose: () => void;
  onDelete: (imageId: string) => Promise<boolean>;
}

function ImageModalBase({ image, onClose, onDelete }: ImageModalProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isConfirmOpen) {
          setIsConfirmOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [image, isConfirmOpen, onClose]);

  const handleConfirmDelete = useCallback(async () => {
    if (!image) return;
    setIsDeleting(true);
    const success = await onDelete(image.imageId);
    setIsDeleting(false);
    setIsConfirmOpen(false);
    if (success) {
      onClose();
    }
  }, [image, onDelete, onClose]);

  return (
    <>
      <AnimatePresence>
        {image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-modal-title"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="modal-surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl shadow-card md:flex-row"
            >
              <div className="relative flex min-h-[280px] flex-1 items-center justify-center bg-black/40 md:min-h-0">
                <img
                  src={image.imageUrl}
                  alt={image.fileName}
                  className="max-h-[45vh] w-full object-contain md:max-h-[90vh]"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close image details"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 md:hidden"
                >
                  <X className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </div>

              <div className="flex w-full flex-col overflow-y-auto md:w-[380px] md:flex-shrink-0">
                <div className="hidden items-center justify-between border-b border-white/[0.08] p-5 md:flex">
                  <h2
                    id="image-modal-title"
                    className="truncate pr-4 font-display text-base font-semibold text-white"
                  >
                    Image details
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close image details"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 space-y-5 p-5">
                  <div>
                    <p className="break-words font-display text-lg font-semibold text-white">
                      {image.fileName}
                    </p>
                    {image.topLabel && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-line px-3 py-1 text-xs font-semibold text-white">
                        {image.topLabel}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        Uploaded
                      </div>
                      <p className="mt-1 font-medium text-slate-100">
                        {formatDate(image.uploadedAt)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
                        File size
                      </div>
                      <p className="mt-1 font-medium text-slate-100">{formatBytes(image.size)}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FileType className="h-3.5 w-3.5" aria-hidden="true" />
                        Type
                      </div>
                      <p className="mt-1 truncate font-medium text-slate-100">
                        {image.contentType}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Tags className="h-3.5 w-3.5" aria-hidden="true" />
                        Labels
                      </div>
                      <p className="mt-1 font-medium text-slate-100">{image.labelCount}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Detected labels
                    </h3>
                    {image.labels.length === 0 ? (
                      <p className="text-sm text-slate-500">No labels detected for this image.</p>
                    ) : (
                      <ul className="space-y-3">
                        {image.labels
                          .slice()
                          .sort((a, b) => b.confidence - a.confidence)
                          .map((label) => (
                            <li key={label.name}>
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-200">{label.name}</span>
                                <span className="tabular-nums text-slate-400">
                                  {label.confidence.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${label.confidence}%` }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: confidenceColor(label.confidence) }}
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/[0.08] p-5">
                  <button
                    type="button"
                    onClick={() => setIsConfirmOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 py-[11px] text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete image
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete this image?"
        description={
          image ? `“${image.fileName}” will be permanently removed. This can't be undone.` : ''
        }
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}

export const ImageModal = memo(ImageModalBase);
