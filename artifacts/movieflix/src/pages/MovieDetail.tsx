import { useParams, Link } from "wouter";
import { useGetMovieDetail, getGetMovieDetailQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Play, Plus, ThumbsUp, ArrowLeft, Clock, Calendar } from "lucide-react";

export default function MovieDetail() {
  const { id } = useParams();
  const movieId = id ? parseInt(id, 10) : 0;
  
  const { data: movie, isLoading } = useGetMovieDetail(movieId, {
    query: {
      enabled: !!movieId,
      queryKey: getGetMovieDetailQueryKey(movieId)
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <Navbar />
        <div className="w-full h-screen bg-muted flex items-end pb-24">
          <div className="container mx-auto px-8 w-full md:w-2/3">
            <div className="h-16 bg-muted-foreground/20 rounded w-1/2 mb-4" />
            <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2" />
            <div className="h-4 bg-muted-foreground/20 rounded w-4/5 mb-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Movie not found</h1>
          <Link href="/" className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      <div className="relative w-full min-h-screen">
        <div className="absolute inset-0 z-0">
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent md:to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-8 pt-32 pb-24 min-h-screen flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start md:items-center">
            
            {/* Mobile Poster (hidden on desktop for a cleaner look, or shown if wanted) */}
            {posterUrl && (
              <div className="w-48 md:w-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 hidden md:block">
                <img src={posterUrl} alt={`${movie.title} Poster`} className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="flex flex-col max-w-3xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-2 drop-shadow-md">
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-xl md:text-2xl text-gray-300 italic mb-6 font-light">
                  "{movie.tagline}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-400 mb-8">
                {movie.vote_average > 0 && (
                  <span className="text-green-500 font-semibold flex items-center gap-1">
                    {Math.round(movie.vote_average * 10)}% Match
                  </span>
                )}
                {releaseYear && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {releaseYear}</span>
                )}
                {movie.runtime ? (
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.runtime}m</span>
                ) : null}
                <span className="px-2 py-0.5 border border-gray-600 rounded text-xs uppercase tracking-wider text-gray-300">
                  {movie.status}
                </span>
              </div>

              <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-8 drop-shadow-sm">
                {movie.overview}
              </p>

              <div className="flex flex-wrap gap-2 mb-10">
                {movie.genres.map(genre => (
                  <span 
                    key={genre.id} 
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md rounded-full text-sm font-medium text-white"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  className="flex items-center gap-2 px-8 py-3 md:py-4 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-white focus:outline-none"
                  data-testid="movie-btn-play"
                >
                  <Play className="w-6 h-6 fill-current" /> Play
                </button>
                <button 
                  className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-400 text-white hover:border-white hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white focus:outline-none"
                  aria-label="Add to My List"
                  data-testid="movie-btn-add"
                >
                  <Plus className="w-6 h-6" />
                </button>
                <button 
                  className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-400 text-white hover:border-white hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white focus:outline-none"
                  aria-label="Rate"
                  data-testid="movie-btn-rate"
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
