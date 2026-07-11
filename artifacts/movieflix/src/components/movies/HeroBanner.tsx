import { Link } from "wouter";
import { Info, Play } from "lucide-react";
import type { Movie } from "@workspace/api-client-react";

interface HeroBannerProps {
  movie: Movie | null;
  isLoading: boolean;
}

export function HeroBanner({ movie, isLoading }: HeroBannerProps) {
  if (isLoading || !movie) {
    return (
      <div className="relative w-full h-[60vh] md:h-[80vh] lg:h-[90vh] bg-muted animate-pulse flex items-end pb-24">
        <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2">
          <div className="h-12 md:h-16 lg:h-20 bg-muted-foreground/20 rounded w-3/4" />
          <div className="h-4 bg-muted-foreground/20 rounded w-full" />
          <div className="h-4 bg-muted-foreground/20 rounded w-5/6" />
          <div className="flex gap-4 mt-4">
            <div className="h-12 w-32 bg-muted-foreground/20 rounded" />
            <div className="h-12 w-40 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] lg:h-[90vh]">
      <div className="absolute inset-0 z-0">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex items-end pb-12 md:pb-24">
        <div className="container mx-auto px-4 md:px-8 flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
            {movie.title}
          </h1>
          <p className="text-base md:text-lg text-gray-200 line-clamp-3 md:line-clamp-4 drop-shadow-md">
            {movie.overview}
          </p>
          <div className="flex gap-4 mt-4">
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded hover:bg-white/80 transition-colors focus:ring-2 focus:ring-white focus:outline-none"
              data-testid="hero-btn-play"
            >
              <Play className="w-5 h-5 fill-current" /> Play
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500/50 text-white font-semibold rounded hover:bg-gray-500/70 transition-colors backdrop-blur-sm focus:ring-2 focus:ring-white focus:outline-none"
              data-testid="hero-btn-info"
            >
              <Info className="w-5 h-5" /> More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
