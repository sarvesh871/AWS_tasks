import { memo } from 'react';
import { Sparkles } from 'lucide-react';

function FooterBase() {
  return (
    <footer className="border-t border-black/[0.06] px-5 py-10 dark:border-white/[0.06] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-line">
            <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">
            Lumen
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Images are labeled automatically and stored securely. Built for fast, searchable
          visual libraries.
        </p>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterBase);
