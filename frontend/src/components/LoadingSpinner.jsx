/**
 * components/LoadingSpinner.jsx
 * Provides two exports:
 *   - default: Inline animated spinner (for buttons, small areas)
 *   - Skeleton: Shimmer placeholder blocks for card-level loading
 */

// ─── Spinner ─────────────────────────────────────────────────────────────────

/**
 * @param {{ size?: 'sm' | 'md' | 'lg', className?: string }} props
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const borders = { sm: 'border-2', md: 'border-2', lg: 'border-[3px]' };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} ${borders[size]} border-white/30 border-t-white rounded-full animate-spin ${className}`}
    />
  );
}

// ─── Skeleton Blocks ──────────────────────────────────────────────────────────

/** Generic shimmer block */
export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Skeleton for CurrentWeatherCard */
export function CurrentWeatherSkeleton() {
  return (
    <div className="glass-card p-6 animate-fade-in" aria-busy="true" aria-label="Loading weather data">
      {/* City + flag row */}
      <div className="flex items-center gap-3 mb-6">
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <SkeletonBlock className="h-7 w-40" />
        <SkeletonBlock className="h-5 w-16 rounded-full ml-auto" />
      </div>

      {/* Temp + icon row */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-20 w-36" />
          <SkeletonBlock className="h-5 w-28" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <SkeletonBlock className="h-24 w-24 rounded-full" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for a single ForecastCard */
export function ForecastCardSkeleton() {
  return (
    <div className="glass-card p-4 flex flex-col items-center gap-3" aria-hidden="true">
      <SkeletonBlock className="h-4 w-12" />
      <SkeletonBlock className="h-12 w-12 rounded-full" />
      <SkeletonBlock className="h-3 w-16" />
      <SkeletonBlock className="h-5 w-10" />
      <SkeletonBlock className="h-3 w-14" />
    </div>
  );
}

/** Skeleton for SearchHistory list */
export function HistorySkeleton({ count = 5 }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading history">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-subtle rounded-xl px-4 py-3 flex items-center gap-3">
          <SkeletonBlock className="h-6 w-6 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
          <SkeletonBlock className="h-6 w-6 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
