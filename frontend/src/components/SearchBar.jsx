/**
 * components/SearchBar.jsx
 * Controlled search input with debounced autocomplete suggestions dropdown.
 *
 * Behaviour:
 *  - Fetches suggestions after 500ms debounce, minimum 2 characters.
 *  - Clicking a suggestion triggers onSearch immediately (no debounce).
 *  - Enter key triggers onSearch with current input value.
 *  - Escape key closes the dropdown.
 *  - Click outside closes the dropdown.
 *  - Keyboard navigation (↑ ↓) through suggestions.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import useDebounce from '@hooks/useDebounce';
import { getSuggestions } from '@api/weatherApi';
import LoadingSpinner from './LoadingSpinner';
import { getFlagEmoji } from '@utils/weatherUtils';

/**
 * @param {{ onSearch: (city: string) => void, loading: boolean }} props
 */
export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [sugLoading, setSugLoading]   = useState(false);
  const [activeIdx, setActiveIdx]     = useState(-1);

  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef     = useRef(null);
  const inputRef       = useRef(null);

  // ─── Fetch suggestions ────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }

    let cancelled = false;
    setSugLoading(true);

    getSuggestions(debouncedQuery.trim())
      .then((res) => {
        if (!cancelled) {
          setSuggestions(res.data || []);
          setShowDrop(true);
          setActiveIdx(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setSugLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ─── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSelect = useCallback((cityName) => {
    setQuery(cityName);
    setShowDrop(false);
    setSuggestions([]);
    onSearch(cityName);
  }, [onSearch]);

  const handleKeyDown = (e) => {
    if (!showDrop || !suggestions.length) {
      if (e.key === 'Enter' && query.trim()) {
        onSearch(query.trim());
        setShowDrop(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        handleSelect(suggestions[activeIdx].name);
      } else if (query.trim()) {
        onSearch(query.trim());
        setShowDrop(false);
      }
    } else if (e.key === 'Escape') {
      setShowDrop(false);
      setActiveIdx(-1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowDrop(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          )}
        </div>

        <input
          id="city-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length && setShowDrop(true)}
          placeholder="Search for a city…"
          autoComplete="off"
          aria-label="Search for a city"
          aria-autocomplete="list"
          aria-controls="suggestions-listbox"
          aria-activedescendant={activeIdx >= 0 ? `suggestion-${activeIdx}` : undefined}
          className="search-input"
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setSuggestions([]); setShowDrop(false); }}
            aria-label="Clear search"
            className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showDrop && (
        <ul
          id="suggestions-listbox"
          role="listbox"
          aria-label="City suggestions"
          className="suggestions-dropdown absolute z-50 w-full mt-2 overflow-hidden animate-slide-down"
        >
          {sugLoading && (
            <li className="flex items-center gap-3 px-4 py-3 text-white/50 text-sm">
              <LoadingSpinner size="sm" />
              Searching…
            </li>
          )}

          {!sugLoading && suggestions.length === 0 && debouncedQuery.length >= 2 && (
            <li className="px-4 py-3 text-white/50 text-sm">No cities found.</li>
          )}

          {!sugLoading && suggestions.map((s, idx) => (
            <li
              key={`${s.lat}-${s.lon}`}
              id={`suggestion-${idx}`}
              role="option"
              aria-selected={activeIdx === idx}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s.name); }}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-white text-sm
                ${activeIdx === idx ? 'bg-white/15' : 'hover:bg-white/10'}`}
            >
              <span className="text-xl flex-shrink-0">{getFlagEmoji(s.country)}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">{s.name}</span>
                <span className="text-white/50 text-xs">
                  {[s.state, s.country].filter(Boolean).join(', ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
