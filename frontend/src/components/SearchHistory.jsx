/**
 * components/SearchHistory.jsx
 * Sidebar list of recent searches.
 * Features: click to re-run, per-item delete, clear-all, skeleton loading.
 */

import { HistorySkeleton } from './LoadingSpinner';
import { getFlagEmoji, timeAgo } from '@utils/weatherUtils';

/**
 * @param {{
 *   history:  Array<{ id: string, city_name: string, country: string, searched_at: string }>,
 *   stats:    { totalSearches: number, mostSearchedCity: string, mostSearchedCount: number, lastSearch: string } | null,
 *   loading:  boolean,
 *   onSelect: (cityName: string) => void,
 *   onRemove: (id: string) => void,
 *   onClear:  () => void,
 * }} props
 */
export default function SearchHistory({ history, stats, loading, onSelect, onRemove, onClear }) {
  return (
    <aside aria-label="Search history" className="glass-card p-5 flex flex-col gap-4 h-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recent Searches
        </h3>

        {history.length > 0 && (
          <button
            id="clear-history-button"
            onClick={onClear}
            aria-label="Clear all search history"
            title="Clear all history"
            className="text-xs text-white/40 hover:text-red-300 transition-colors duration-200 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 overflow-y-auto max-h-[420px] lg:max-h-none no-scrollbar">

        {/* Analytics Card */}
        {stats && stats.totalSearches > 0 && !loading && (
          <div className="glass-subtle rounded-xl p-4 flex flex-col gap-3 animate-fade-in border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-xs uppercase tracking-wider font-semibold">Total Searches</span>
              <span className="text-white font-bold text-lg">{stats.totalSearches}</span>
            </div>
            
            {stats.mostSearchedCity && (
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-white/60 text-xs">Most searched</span>
                <span className="text-white text-sm font-medium">
                  {stats.mostSearchedCity} <span className="text-white/40 text-xs">({stats.mostSearchedCount}×)</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* History List */}
        {loading ? (
          <HistorySkeleton count={5} />
        ) : history.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {history.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HistoryItem({ item, onSelect, onRemove }) {
  return (
    <li className="group flex items-center gap-2 rounded-xl overflow-hidden">
      {/* Clickable area */}
      <button
        id={`history-item-${item.id}`}
        onClick={() => onSelect(item.city_name)}
        aria-label={`Search for ${item.city_name} again`}
        className="glass-subtle flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                   transition-all duration-150 hover:translate-x-0.5"
      >
        <span className="text-xl flex-shrink-0">{getFlagEmoji(item.country)}</span>
        <div className="flex-1 min-w-0">
          <span className="text-white font-medium text-sm block truncate">{item.city_name}</span>
          <span className="text-white/40 text-xs">
            {item.country ? `${item.country} · ` : ''}{timeAgo(item.searched_at)}
          </span>
        </div>
        {/* Arrow indicator */}
        <svg
          className="w-3.5 h-3.5 text-white/25 group-hover:text-white/60 flex-shrink-0 transition-colors"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Delete button */}
      <button
        id={`delete-history-${item.id}`}
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.city_name} from history`}
        title="Remove"
        className="flex-shrink-0 p-2 text-white/20 hover:text-red-300 transition-colors duration-150
                   opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <span className="text-4xl opacity-40 animate-pulse-slow">🔍</span>
      <p className="text-white/40 text-sm leading-relaxed">
        Your recent searches will<br />appear here
      </p>
    </div>
  );
}
