import { 
  useGetTrendingMovies, 
  useGetPopularMovies, 
  useGetTopRatedMovies, 
  useGetNowPlayingMovies, 
  useGetUpcomingMovies,
  type Movie,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroBanner } from "@/components/movies/HeroBanner";
import { MovieRow } from "@/components/movies/MovieRow";
import { useMyList } from "@/context/MyListContext";

function myListItemToMovie(item: {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number | null;
  release_date?: string | null;
}): Movie {
  return {
    id: item.tmdb_id,
    title: item.title,
    poster_path: item.poster_path ?? null,
    backdrop_path: item.backdrop_path ?? null,
    vote_average: item.vote_average ?? 0,
    vote_count: 0,
    overview: "",
    release_date: item.release_date ?? "",
    genre_ids: [],
    popularity: 0,
  };
}

export default function Home() {
  const { data: trending, isLoading: isLoadingTrending } = useGetTrendingMovies();
  const { data: popular, isLoading: isLoadingPopular } = useGetPopularMovies();
  const { data: topRated, isLoading: isLoadingTopRated } = useGetTopRatedMovies();
  const { data: nowPlaying, isLoading: isLoadingNowPlaying } = useGetNowPlayingMovies();
  const { data: upcoming, isLoading: isLoadingUpcoming } = useGetUpcomingMovies();

  const { items: myListItems, isLoading: isLoadingMyList } = useMyList();
  const myListMovies = myListItems.map(myListItemToMovie);

  const featuredMovie = trending?.results?.[0] || popular?.results?.[0] || null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroBanner movie={featuredMovie} isLoading={isLoadingTrending && isLoadingPopular} />
        
        <div className="relative z-20 -mt-6 md:-mt-10 pb-20 flex flex-col gap-4 md:gap-8">
          {(myListMovies.length > 0 || isLoadingMyList) && (
            <MovieRow
              title="My List"
              movies={myListMovies}
              isLoading={isLoadingMyList}
            />
          )}
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
