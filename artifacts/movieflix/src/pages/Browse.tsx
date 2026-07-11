import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetGenres,
  useGetMoviesByGenre,
  useSearchMovies,
  getGetGenresQueryKey,
  getGetMoviesByGenreQueryKey,
  getSearchMoviesQueryKey,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { MovieCard, SkeletonMovieCard } from "@/components/movies/MovieCard";

const POPULAR_GENRES = [28, 12, 35, 18, 27, 9648, 878, 53, 10749, 16];

export default function Browse() {
  const [location] = useLocation();

  const initialQuery = (() => {
    try {
      const params = new URLSearchParams(location.split("?")[1] ?? "");
      return params.get("q") ?? "";
    } catch {
      return "";
    }
  })();

  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [searchQuery] = useState(initialQuery);

  const { data: genreData, isLoading: isLoadingGenres } = useGetGenres({
    query: { queryKey: getGetGenresQueryKey() },
  });
  const genres = genreData?.genres ?? [];
  const popularGenres = POPULAR_GENRES.map((id) => genres.find((g: { id: number; name: string }) => g.id === id)).filter(Boolean) as typeof genres;
  const displayGenres = popularGenres.length > 0 ? popularGenres : genres;

  const genreMoviesParams = { genre_id: selectedGenreId ?? 28, page: 1 };
  const { data: genreMovies, isLoading: isLoadingGenreMovies } = useGetMoviesByGenre(
    genreMoviesParams,
    { query: { enabled: selectedGenreId !== null && !searchQuery, queryKey: getGetMoviesByGenreQueryKey(genreMoviesParams) } }
  );

  const searchParams = { q: searchQuery, page: 1 };
  const { data: searchData, isLoading: isLoadingSearch } = useSearchMovies(
    searchParams,
    { query: { enabled: searchQuery.length >= 2, queryKey: getSearchMoviesQueryKey(searchParams) } }
  );

  const fallbackParams = { genre_id: 28, page: 1 };
  const { data: trendingFallback, isLoading: isLoadingTrending } = useGetMoviesByGenre(
    fallbackParams,
    { query: { enabled: !searchQuery && selectedGenreId === null, queryKey: getGetMoviesByGenreQueryKey(fallbackParams) } }
  );

  const movies = searchQuery
    ? searchData?.results ?? []
    : selectedGenreId !== null
    ? genreMovies?.results ?? []
    : trendingFallback?.results ?? [];

  const isLoading = searchQuery
    ? isLoadingSearch
    : selectedGenreId !== null
    ? isLoadingGenreMovies
    : isLoadingTrending;

  const selectedGenreName = selectedGenreId
    ? genres.find((g) => g.id === selectedGenreId)?.name ?? "Movies"
    : searchQuery
    ? `Results for "${searchQuery}"`
    : "All Movies";

  useEffect(() => {
    if (!isLoadingGenres && displayGenres.length > 0 && selectedGenreId === null && !searchQuery) {
      setSelectedGenreId(displayGenres[0].id);
    }
  }, [isLoadingGenres, displayGenres, selectedGenreId, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 md:px-8 container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Browse</h1>

        {/* Genre pills */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-2 mb-8" data-testid="genre-pills">
            {isLoadingGenres
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-zinc-800 rounded-full animate-pulse" />
                ))
              : displayGenres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenreId(genre.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedGenreId === genre.id
                        ? "bg-primary text-white"
                        : "bg-zinc-800 text-white/70 hover:bg-zinc-700 hover:text-white"
                    }`}
                    data-testid={`genre-pill-${genre.id}`}
                  >
                    {genre.name}
                  </button>
                ))}
          </div>
        )}

        {/* Section heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">{selectedGenreName}</h2>
          {searchQuery && (
            <a
              href="/browse"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Clear search
            </a>
          )}
        </div>

        {/* Movie grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          data-testid="movie-grid"
        >
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => <SkeletonMovieCard key={i} />)
            : movies.length === 0
            ? (
              <div className="col-span-full py-20 text-center text-white/40">
                {searchQuery ? `No results for "${searchQuery}"` : "No movies found"}
              </div>
            )
            : movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
        </div>
      </div>
    </div>
  );
}
