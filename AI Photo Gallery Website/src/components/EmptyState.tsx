import { memo } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, SearchX } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'empty' | 'no-results';
  searchTerm?: string;
}

function EmptyStateBase({ variant = 'empty', searchTerm }: EmptyStateProps) {
  const isNoResults = variant === 'no-results';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center"
    >
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-black/[0.06] bg-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.04]">
        <div className="absolute inset-0 rounded-3xl bg-accent-line opacity-10 blur-xl" />
        {isNoResults ? (
          <SearchX className="h-9 w-9 text-slate-400" aria-hidden="true" />
        ) : (
          <ImageOff className="h-9 w-9 text-slate-400" aria-hidden="true" />
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-white">
        {isNoResults ? 'No matches found' : 'No images uploaded yet'}
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {isNoResults
          ? `Nothing matches “${searchTerm}”. Try a different label or clear your search.`
          : 'Drop a few photos above to see them appear here, fully labeled by AI.'}
      </p>
    </motion.div>
  );
}

export const EmptyState = memo(EmptyStateBase);
