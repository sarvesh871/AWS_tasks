function SkeletonCardBase() {
  return (
    <div className="glass overflow-hidden rounded-2xl" aria-hidden="true">
      <div className="skeleton-shimmer aspect-[4/5] w-full animate-shimmer" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton-shimmer h-3.5 w-3/4 animate-shimmer rounded-full" />
        <div className="skeleton-shimmer h-3 w-1/2 animate-shimmer rounded-full" />
      </div>
    </div>
  );
}

export const SkeletonCard = SkeletonCardBase;
