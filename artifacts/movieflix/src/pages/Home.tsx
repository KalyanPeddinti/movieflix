import { 
  useGetTrendingMovies, 
  useGetPopularMovies, 
  useGetTopRatedMovies, 
  useGetNowPlayingMovies, 
  useGetUpcomingMovies 
} from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroBanner } from "@/components/movies/HeroBanner";
import { MovieRow } from "@/components/movies/MovieRow";

export default function Home() {
  const { data: trending, isLoading: isLoadingTrending } = useGetTrendingMovies();
  const { data: popular, isLoading: isLoadingPopular } = useGetPopularMovies();
  const { data: topRated, isLoading: isLoadingTopRated } = useGetTopRatedMovies();
  const { data: nowPlaying, isLoading: isLoadingNowPlaying } = useGetNowPlayingMovies();
  const { data: upcoming, isLoading: isLoadingUpcoming } = useGetUpcomingMovies();

  const featuredMovie = trending?.results?.[0] || popular?.results?.[0] || null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroBanner movie={featuredMovie} isLoading={isLoadingTrending && isLoadingPopular} />
        
        <div className="relative z-20 -mt-24 md:-mt-32 pb-20 flex flex-col gap-4 md:gap-8">
          <MovieRow title="Trending Now" movies={trending?.results || []} isLoading={isLoadingTrending} />
          <MovieRow title="Popular" movies={popular?.results || []} isLoading={isLoadingPopular} />
          <MovieRow title="Now Playing" movies={nowPlaying?.results || []} isLoading={isLoadingNowPlaying} />
          <MovieRow title="Top Rated" movies={topRated?.results || []} isLoading={isLoadingTopRated} />
          <MovieRow title="Upcoming" movies={upcoming?.results || []} isLoading={isLoadingUpcoming} />
        </div>
      </main>
    </div>
  );
}
