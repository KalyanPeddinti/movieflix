import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import {
  useGetTrendingMovies,
  useGetPopularMovies,
  useGetTopRatedMovies,
  useGetNowPlayingMovies,
  useGetUpcomingMovies,
  useGetMyList,
} from '@workspace/api-client-react';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import type { Movie } from '@workspace/api-client-react';

function myListItemToMovie(item: any): Movie {
  return {
    id: item.tmdb_id,
    title: item.title,
    overview: '',
    poster_path: item.poster_path ?? null,
    backdrop_path: item.backdrop_path ?? null,
    vote_average: item.vote_average ?? 0,
    vote_count: 0,
    release_date: item.release_date ?? '',
    genre_ids: [],
    popularity: 0,
  };
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const { data: trending, isLoading: loadingTrending } = useGetTrendingMovies();
  const { data: popular, isLoading: loadingPopular } = useGetPopularMovies();
  const { data: topRated, isLoading: loadingTopRated } = useGetTopRatedMovies();
  const { data: nowPlaying, isLoading: loadingNowPlaying } = useGetNowPlayingMovies();
  const { data: upcoming, isLoading: loadingUpcoming } = useGetUpcomingMovies();
  const { data: myList } = useGetMyList();

  const featured = trending?.results?.[0] ?? popular?.results?.[0] ?? null;
  const myListMovies = (myList?.items ?? []).map(myListItemToMovie);

  const topPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Floating header */}
      <View
        style={[
          s.header,
          { paddingTop: insets.top + topPad + 8, paddingBottom: 8 },
        ]}
        pointerEvents="box-none"
      >
        <Text style={[s.logoText, { color: colors.primary }]}>MovieFlix</Text>
        <View style={s.headerRight}>
          <Pressable
            onPress={() => router.push('/movie/0')}
            style={s.iconBtn}
            hitSlop={8}
          >
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              s.avatar,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={logout}
            hitSlop={8}
          >
            <Text style={s.avatarText}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner movie={featured} isLoading={loadingTrending && loadingPopular} />

        <View style={{ marginTop: 16 }}>
          {myListMovies.length > 0 && (
            <MovieRow title="My List" movies={myListMovies} isLoading={false} />
          )}
          <MovieRow title="Trending Now" movies={trending?.results ?? []} isLoading={loadingTrending} />
          <MovieRow title="Popular" movies={popular?.results ?? []} isLoading={loadingPopular} />
          <MovieRow title="Now Playing" movies={nowPlaying?.results ?? []} isLoading={loadingNowPlaying} />
          <MovieRow title="Top Rated" movies={topRated?.results ?? []} isLoading={loadingTopRated} />
          <MovieRow title="Upcoming" movies={upcoming?.results ?? []} isLoading={loadingUpcoming} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoText: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
});
