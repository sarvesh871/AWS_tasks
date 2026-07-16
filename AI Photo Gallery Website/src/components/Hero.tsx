import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Wand2 } from 'lucide-react';

interface HeroProps {
  onScrollToUpload: () => void;
}

function HeroBase({ onScrollToUpload }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-aurora-gradient opacity-80" />
      <div
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-accent-violet/30 blur-3xl animate-blob"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-32 -z-10 h-80 w-80 rounded-full bg-accent-cyan/20 blur-3xl animate-blob"
        style={{ animationDelay: '4s' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/3 top-0 -z-10 h-64 w-64 rounded-full bg-accent-pink/10 blur-3xl animate-blob"
        style={{ animationDelay: '8s' }}
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
        >
          <Wand2 className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Automatic label recognition, powered by AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
        >
          Every image,
          <br />
          <span className="text-gradient">understood instantly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-balance text-base text-slate-500 dark:text-slate-400 sm:text-lg"
        >
          Drop in your photos and Lumen automatically detects objects, scenes, and
          concepts — searchable the moment they land.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={onScrollToUpload}
            className="group inline-flex items-center gap-2 rounded-full bg-accent-line px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Start uploading
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroBase);
