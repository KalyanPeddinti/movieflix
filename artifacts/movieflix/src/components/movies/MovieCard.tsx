import { Link } from "wouter";
import type { Movie } from "@workspace/api-client-react";

export function MovieCard({ movie }: { movie: Movie }) {
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;

  return (
    <Link href={`/movie/${movie.id}`} className="block flex-shrink-0 group relative w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] aspect-[2/3] overflow-hidden rounded-md transition-all duration-300 hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary" data-testid={`card-movie-${movie.id}`}>
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center p-4 text-center">
          <span className="text-sm font-medium text-muted-foreground">{movie.title}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-medium text-sm md:text-base truncate">{movie.title}</h3>
      </div>
    </Link>
  );
}

export function SkeletonMovieCard() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] aspect-[2/3] rounded-md bg-muted animate-pulse" />
  );
}
