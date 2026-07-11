import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetMovieDetail, getGetMovieDetailQueryKey } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/context/WatchlistContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKDROP_HEIGHT = 280;
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export default function MovieDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const { user } = useAuth();
  const { isInList, addToList, removeFromList } = useWatchlist();

  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = parseInt(id ?? '0', 10);

  const { data: movie, isLoading, isError } = useGetMovieDetail(movieId, {
    query: { enabled: !isNaN(movieId) && movieId > 0, queryKey: getGetMovieDetailQueryKey(movieId) },
  });

  const inList = movie ? isInList(movie.id) : false;
  const topPad = isWeb ? 67 : insets.top;

  const handleWatchlist = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!movie) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (inList) {
      removeFromList(movie.id);
    } else {
      addToList({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path ?? null,
        backdrop_path: movie.backdrop_path ?? null,
        vote_average: movie.vote_average ?? null,
        release_date: movie.release_date,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ marginTop: 100 }} color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !movie) {
    return (
      <View style={[styles.screen, styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.foreground, fontFamily: 'Outfit_600SemiBold' }]}>
          Couldn't load this movie
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryText, { fontFamily: 'Outfit_600SemiBold' }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const backdropUri = movie.backdrop_path
    ? `${BACKDROP_BASE}${movie.backdrop_path}`
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.backBtn, { top: topPad + 8 }]}
        hitSlop={12}
      >
        <View style={styles.backBtnInner}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </View>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 84 : insets.bottom + 32 }}
      >
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          {backdropUri ? (
            <Image
              source={{ uri: backdropUri }}
              style={styles.backdrop}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.backdrop, { backgroundColor: colors.muted }]} />
          )}
          <LinearGradient
            colors={['transparent', colors.background]}
            locations={[0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Poster + meta side by side */}
          <View style={styles.topRow}>
            <View style={[styles.poster, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              {movie.poster_path ? (
                <Image
                  source={{ uri: `${POSTER_BASE}${movie.poster_path}` }}
                  style={[styles.poster, { borderRadius: colors.radius }]}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.poster, styles.noPoster, { borderRadius: colors.radius }]}>
                  <Text style={[styles.noPosterText, { color: colors.mutedForeground }]}>
                    {movie.title?.charAt(0) ?? '?'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.metaCol}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Outfit_700Bold' }]} numberOfLines={3}>
                {movie.title}
              </Text>
              {movie.tagline ? (
                <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]} numberOfLines={2}>
                  {movie.tagline}
                </Text>
              ) : null}

              <View style={styles.badges}>
                {year ? (
                  <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.badgeText, { color: colors.secondaryForeground, fontFamily: 'Outfit_500Medium' }]}>
                      {year}
                    </Text>
                  </View>
                ) : null}
                {runtime ? (
                  <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.badgeText, { color: colors.secondaryForeground, fontFamily: 'Outfit_500Medium' }]}>
                      {runtime}
                    </Text>
                  </View>
                ) : null}
                {movie.vote_average > 0 ? (
                  <View style={[styles.badge, { backgroundColor: 'rgba(255,215,0,0.15)' }]}>
                    <Ionicons name="star" size={11} color="#FFD700" />
                    <Text style={[styles.badgeText, { color: '#FFD700', fontFamily: 'Outfit_600SemiBold' }]}>
                      {movie.vote_average.toFixed(1)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 ? (
            <View style={styles.genres}>
              {movie.genres.map((g) => (
                <View key={g.id} style={[styles.genreChip, { backgroundColor: colors.secondary, borderRadius: 20 }]}>
                  <Text style={[styles.genreText, { color: colors.secondaryForeground, fontFamily: 'Outfit_500Medium' }]}>
                    {g.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Watchlist button */}
          <Pressable
            onPress={handleWatchlist}
            style={({ pressed }) => [
              styles.watchlistBtn,
              {
                backgroundColor: inList ? colors.secondary : colors.primary,
                borderRadius: colors.radius,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons
              name={inList ? 'checkmark' : 'add'}
              size={20}
              color={inList ? colors.secondaryForeground : '#fff'}
            />
            <Text
              style={[
                styles.watchlistBtnText,
                { color: inList ? colors.secondaryForeground : '#fff', fontFamily: 'Outfit_600SemiBold' },
              ]}
            >
              {inList ? 'In My List' : '+ My List'}
            </Text>
          </Pressable>

          {/* Overview */}
          {movie.overview ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Outfit_600SemiBold' }]}>
                Overview
              </Text>
              <Text style={[styles.overview, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
                {movie.overview}
              </Text>
            </View>
          ) : null}

          {/* Info rows */}
          <View style={[styles.infoSection, { borderColor: colors.border }]}>
            {movie.status ? (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: 'Outfit_500Medium' }]}>Status</Text>
                <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: 'Outfit_400Regular' }]}>{movie.status}</Text>
              </View>
            ) : null}
            {movie.vote_count > 0 ? (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: 'Outfit_500Medium' }]}>Votes</Text>
                <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: 'Outfit_400Regular' }]}>
                  {movie.vote_count.toLocaleString()}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  errorText: { fontSize: 18, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 15 },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  backBtnInner: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropContainer: {
    width: SCREEN_WIDTH,
    height: BACKDROP_HEIGHT,
    position: 'relative',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  poster: {
    width: 110,
    height: 165,
    flexShrink: 0,
    overflow: 'hidden',
  },
  noPoster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPosterText: {
    fontSize: 36,
    fontFamily: 'Outfit_700Bold',
  },
  metaCol: {
    flex: 1,
    gap: 6,
    paddingTop: 4,
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
  },
  tagline: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  genreText: {
    fontSize: 12,
  },
  watchlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  watchlistBtnText: {
    fontSize: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
  },
  overview: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
});
