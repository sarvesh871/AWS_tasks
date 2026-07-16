import { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Moon, Sun, ImageIcon } from 'lucide-react';
import type { Theme } from '../types';

interface NavbarProps {
  imageCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

function NavbarBase({ imageCount, isRefreshing, onRefresh, theme, onToggleTheme }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-black/[0.06] shadow-black/20 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent-line shadow-glow-sm">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Lumen
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                AI Image Gallery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="hidden items-center gap-1.5 rounded-full border border-black/[0.08] bg-black/[0.02] px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 sm:flex"
              aria-label={`${imageCount} images in gallery`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-accent-violet" aria-hidden="true" />
              <span className="tabular-nums">{imageCount}</span>
              <span className="text-slate-500 dark:text-slate-500">
                {imageCount === 1 ? 'image' : 'images'}
              </span>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh gallery"
              className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.02] text-slate-600 transition-colors hover:bg-black/[0.06] hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <motion.span
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isRefreshing
                    ? { repeat: Infinity, duration: 0.8, ease: 'linear' }
                    : { duration: 0.2 }
                }
                className="flex"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </motion.span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="relative flex h-9 w-16 items-center rounded-full border border-black/[0.08] bg-black/[0.02] px-1 transition-colors hover:bg-black/[0.06] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.08]"
            >
              <motion.div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-line shadow-glow-sm"
                animate={{ x: theme === 'dark' ? 0 : 28 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              >
                {theme === 'dark' ? (
                  <Moon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                ) : (
                  <Sun className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export const Navbar = memo(NavbarBase);
