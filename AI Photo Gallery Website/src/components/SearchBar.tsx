import { memo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  isSearching?: boolean;
}

function SearchBarBase({ value, onChange, resultCount, isSearching }: SearchBarProps) {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-10 sm:px-8">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by label — “dog”, “sunset”, “mountain”…"
          aria-label="Search images by label"
          className="glass w-full rounded-2xl py-3.5 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-500 transition-shadow focus:shadow-glow-sm dark:text-white"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-black/[0.06] hover:text-slate-800 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
      {value && !isSearching && typeof resultCount === 'number' && (
        <p className="mt-2.5 pl-1 text-xs text-slate-500 dark:text-slate-400">
          {resultCount} {resultCount === 1 ? 'result' : 'results'} for “{value}”
        </p>
      )}
    </section>
  );
}

export const SearchBar = memo(SearchBarBase);
