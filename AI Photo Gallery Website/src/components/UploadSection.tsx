import { memo, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { UploadItem } from '../types';
import { formatBytes } from '../utils/format';
import { MAX_FILE_SIZE_BYTES } from '../utils/validation';

interface UploadSectionProps {
  uploads: UploadItem[];
  onFilesAdded: (files: File[]) => void;
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
}

function statusLabel(item: UploadItem): string {
  switch (item.status) {
    case 'pending':
      return 'Waiting…';
    case 'uploading':
      return `Uploading — ${item.progress}%`;
    case 'success':
      return 'Uploaded';
    case 'error':
      return item.error ?? 'Upload failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return '';
  }
}

function UploadRow({
  item,
  onCancel,
  onDismiss,
}: {
  item: UploadItem;
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const isActive = item.status === 'pending' || item.status === 'uploading';
  const isDone = item.status === 'success' || item.status === 'cancelled' || item.status === 'error';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      className="glass flex items-center gap-3.5 rounded-2xl p-3"
    >
      <img
        src={item.previewUrl}
        alt=""
        className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {item.file.name}
          </p>
          <span className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
            {formatBytes(item.file.size)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {item.status === 'error' ? (
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-400" aria-hidden="true" />
          ) : item.status === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
          ) : item.status === 'uploading' ? (
            <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-accent-cyan" aria-hidden="true" />
          ) : null}
          <span
            className={`truncate text-xs ${
              item.status === 'error'
                ? 'text-red-400'
                : item.status === 'success'
                  ? 'text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {statusLabel(item)}
          </span>
        </div>

        {isActive && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-accent-line"
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => (isDone ? onDismiss(item.id) : onCancel(item.id))}
        aria-label={isDone ? `Dismiss ${item.file.name}` : `Cancel upload of ${item.file.name}`}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-black/[0.06] hover:text-slate-800 dark:hover:bg-white/[0.08] dark:hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

function UploadSectionBase({ uploads, onFilesAdded, onCancel, onDismiss }: UploadSectionProps) {
  const handleDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      rejections.forEach((rejection) => {
        const reason = rejection.errors[0]?.code;
        if (reason === 'file-too-large') {
          toast.error(`"${rejection.file.name}" exceeds the 10 MB size limit.`);
        } else if (reason === 'file-invalid-type') {
          toast.error(`"${rejection.file.name}" is not a supported image type.`);
        } else {
          toast.error(`"${rejection.file.name}" could not be added.`);
        }
      });

      if (accepted.length > 0) {
        onFilesAdded(accepted);
      }
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
      'image/heic': [],
      'image/heif': [],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
    noClick: true,
    multiple: true,
  });

  return (
    <section id="upload" className="mx-auto max-w-5xl px-5 sm:px-8">
      <div
        {...getRootProps()}
        className={`group relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-colors sm:p-14 ${
          isDragActive
            ? 'border-accent-violet bg-accent-violet/[0.06]'
            : 'border-black/[0.12] bg-black/[0.015] hover:border-black/25 dark:border-white/[0.12] dark:bg-white/[0.02] dark:hover:border-white/25'
        }`}
      >
        <input {...getInputProps()} aria-label="Upload images" />

        <motion.div
          animate={isDragActive ? { scale: 1.08 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-line shadow-glow animate-float"
        >
          <UploadCloud className="h-8 w-8 text-white" aria-hidden="true" />
        </motion.div>

        <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
          {isDragActive ? 'Drop images to upload' : 'Drag & drop images here'}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          JPG, PNG, GIF, WEBP or HEIC — up to 10 MB per file.
        </p>

        <button
          type="button"
          onClick={open}
          className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/[0.03] px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-black/[0.06] dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.1]"
        >
          Browse files
        </button>
      </div>

      <AnimatePresence initial={false}>
        {uploads.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex flex-col gap-3"
          >
            <AnimatePresence initial={false}>
              {uploads.map((item) => (
                <UploadRow key={item.id} item={item} onCancel={onCancel} onDismiss={onDismiss} />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}

export const UploadSection = memo(UploadSectionBase);
