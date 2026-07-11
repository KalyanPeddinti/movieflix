import { useCallback, useContext } from "react";
import { Link } from "wouter";
import type { Movie } from "@workspace/api-client-react";
import { MyListContext } from "@/context/MyListContext";

function WatchlistButton({ movie }: { movie: Movie }) {
  const ctx = useContext(MyListContext);

  const inList = ctx?.isInList(movie.id) ?? false;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!ctx) return;
      if (inList) {
        ctx.removeFromList(movie.id);
      } else {
        ctx.addToList({
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path ?? null,
          backdrop_path: movie.backdrop_path ?? null,
          vote_average: movie.vote_average ?? null,
          release_date: movie.release_date ?? null,
        });
      }
    },
    [ctx, inList, movie]
  );

  if (!ctx) return null;

  return (
    <button
      onClick={handleClick}
      aria-label={inList ? "Remove from My List" : "Add to My List"}
      data-testid={`btn-watchlist-${movie.id}`}
      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg ${
        inList
          ? "bg-primary text-white"
          : "bg-black/70 text-white hover:bg-primary"
      }`}
    >
      {inList ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
}

export function MovieCard({ movie }: { movie: Movie }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <div className="relative flex-shrink-0 group w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px]">
      <Link
        href={`/movie/${movie.id}`}
        className="block aspect-[2/3] overflow-hidden rounded-md transition-all duration-300 hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary"
        data-testid={`card-movie-${movie.id}`}
      >
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-md">
          <h3 className="text-white font-medium text-sm md:text-base truncate">{movie.title}</h3>
        </div>
      </Link>
      <WatchlistButton movie={movie} />
    </div>
  );
}

export function SkeletonMovieCard() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] aspect-[2/3] rounded-md bg-muted animate-pulse" />
  );
}
