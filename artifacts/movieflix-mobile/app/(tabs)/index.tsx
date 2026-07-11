import React, { useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useGetTrendingMovies,
  useGetPopularMovies,
  useGetTopRatedMovies,
  useGetNowPlayingMovies,
  useGetUpcomingMovies,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import { type MovieCardMovie } from '@/components/MovieCard';

function watchlistItemToMovie(item: {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  vote_average?: number | null;
}): MovieCardMovie {
  return {
    id: item.tmdb_id,
    title: item.title,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
  };
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { items: watchlistItems } = useWatchlist();
  const isWeb = Platform.OS === 'web';

  const [refreshing, setRefreshing] = useState(false);

  const { data: trending, isLoading: loadingTrending, refetch: refetchTrending } = useGetTrendingMovies();
  const { data: popular, isLoading: loadingPopular } = useGetPopularMovies();
  const { data: topRated, isLoading: loadingTopRated } = useGetTopRatedMovies();
  const { data: nowPlaying, isLoading: loadingNowPlaying } = useGetNowPlayingMovies();
  const { data: upcoming, isLoading: loadingUpcoming } = useGetUpcomingMovies();

  const featuredMovie = trending?.results?.[0] ?? popular?.results?.[0] ?? null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const topPadding = isWeb ? 67 : insets.top;
  // Banner sits under the absolute header so we need the hero to account for top
  const bannerTopPadding = topPadding + 50; // 50px for the nav bar overlay

  const myListMovies = watchlistItems.map(watchlistItemToMovie);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: isWeb ? 84 : insets.bottom + 80 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Spacer for header overlay */}
      <View style={{ height: bannerTopPadding, position: 'absolute', top: 0 }} />

      <View style={{ marginTop: 0 }}>
        <HeroBanner movie={featuredMovie} isLoading={loadingTrending} />
      </View>

      <View style={styles.rows}>
        {user && myListMovies.length > 0 && (
          <MovieRow title="My List" movies={myListMovies} />
        )}
        <MovieRow title="Trending Now" movies={trending?.results ?? []} isLoading={loadingTrending} />
        <MovieRow title="Popular" movies={popular?.results ?? []} isLoading={loadingPopular} />
        <MovieRow title="Now Playing" movies={nowPlaying?.results ?? []} isLoading={loadingNowPlaying} />
        <MovieRow title="Top Rated" movies={topRated?.results ?? []} isLoading={loadingTopRated} />
        <MovieRow title="Upcoming" movies={upcoming?.results ?? []} isLoading={loadingUpcoming} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  rows: {
    gap: 28,
    paddingTop: 16,
  },
});
