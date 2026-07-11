import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useSearchMovies, getSearchMoviesQueryKey } from "@workspace/api-client-react";

const IMG_BASE = "https://image.tmdb.org/t/p/w92";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const debouncedQuery = useDebounce(query.trim(), 350);

  const searchParams = { q: debouncedQuery, page: 1 };
  const { data, isFetching } = useSearchMovies(searchParams, {
    query: {
      enabled: debouncedQuery.length >= 2,
      staleTime: 30_000,
      queryKey: getSearchMoviesQueryKey(searchParams),
    },
  });

  const results = data?.results?.slice(0, 8) ?? [];

  const expand = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const collapse = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        collapse();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [collapse]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") collapse();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        expand();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [collapse, expand]);

  const handleResultClick = (id: number) => {
    collapse();
    navigate(`/movie/${id}`);
  };

  const showDropdown = open && debouncedQuery.length >= 2;

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Search icon button */}
      {!open && (
        <button
          onClick={expand}
          className="flex items-center justify-center w-9 h-9 text-white/70 hover:text-white transition-colors"
          aria-label="Open search"
          data-testid="btn-search-open"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      )}

      {/* Expanded search input */}
      {open && (
        <div className="flex items-center border border-white/30 bg-black/80 backdrop-blur-sm rounded px-3 py-1.5 gap-2 w-56 md:w-72 transition-all">
          <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies…"
            className="bg-transparent text-white text-sm placeholder-white/40 outline-none flex-1 min-w-0"
            data-testid="input-search"
          />
          {isFetching && (
            <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin shrink-0" />
          )}
          <button
            onClick={collapse}
            className="text-white/50 hover:text-white transition-colors shrink-0"
            aria-label="Close search"
            data-testid="btn-search-close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Results dropdown */}
      {showDropdown && (
        <div
          className="absolute top-12 right-0 w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
          data-testid="search-results"
        >
          {results.length === 0 && !isFetching && (
            <div className="px-4 py-6 text-center text-white/40 text-sm">
              No results for "{debouncedQuery}"
            </div>
          )}
          {results.map((movie) => (
            <button
              key={movie.id}
              onClick={() => handleResultClick(movie.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              data-testid={`search-result-${movie.id}`}
            >
              <div className="w-10 h-14 rounded overflow-hidden bg-zinc-800 shrink-0">
                {movie.poster_path ? (
                  <img
                    src={`${IMG_BASE}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] text-center px-1">
                    {movie.title.slice(0, 3)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {movie.release_date ? movie.release_date.slice(0, 4) : ""}
                  {movie.vote_average
                    ? ` · ${Math.round(movie.vote_average * 10)}%`
                    : ""}
                </p>
              </div>
            </button>
          ))}
          {results.length > 0 && (
            <Link
              href={`/browse?q=${encodeURIComponent(debouncedQuery)}`}
              onClick={collapse}
              className="block px-4 py-3 text-center text-xs text-primary hover:text-primary/80 border-t border-white/10 transition-colors"
              data-testid="link-see-all-results"
            >
              See all results for "{debouncedQuery}"
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
