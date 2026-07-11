import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard, SkeletonMovieCard } from "./MovieCard";
import type { Movie } from "@workspace/api-client-react";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLoading: boolean;
}

export function MovieRow({ title, movies, isLoading }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="py-4 md:py-6 group relative">
      <h2 className="text-lg md:text-2xl font-semibold mb-4 px-4 md:px-8 text-foreground">{title}</h2>
      
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-black/80 focus:outline-none disabled:opacity-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 snap-x pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonMovieCard key={i} />)
            : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-black/80 focus:outline-none"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
