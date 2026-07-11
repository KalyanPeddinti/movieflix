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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import {
  useGetMovieDetail,
  useGetMyList,
  useAddToMyList,
  useRemoveFromMyList,
  getGetMyListQueryKey,
} from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const BACKDROP_H = height * 0.5;

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = parseInt(id ?? '0', 10);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: movie, isLoading, isError } = useGetMovieDetail(movieId);
  const { data: myList } = useGetMyList();
  const addMutation = useAddToMyList();
  const removeMutation = useRemoveFromMyList();

  const isInList = myList?.items?.some((item) => item.tmdb_id === movieId) ?? false;
  const isMutating = addMutation.isPending || removeMutation.isPending;

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: getGetMyListQueryKey() });

  const toggleList = async () => {
    try {
      if (isInList) {
        await removeMutation.mutateAsync({ tmdbId: movieId });
      } else if (movie) {
        await addMutation.mutateAsync({
          data: {
            tmdb_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path ?? null,
            backdrop_path: movie.backdrop_path ?? null,
            vote_average: movie.vote_average ?? null,
            release_date: movie.release_date ?? null,
          },
        });
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      invalidateList();
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  if (isLoading) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !movie) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[s.errorText, { color: colors.mutedForeground }]}>Movie not found</Text>
      </View>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const year = movie.release_date?.split('-')[0] ?? '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
    >
      {/* Backdrop */}
      <View style={{ height: BACKDROP_H + topPad }}>
        {backdropUrl ? (
          <Image
            source={{ uri: backdropUrl }}
            style={[StyleSheet.absoluteFill]}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.muted }]} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(10,10,10,0.5)', colors.background]}
          locations={[0.4, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(10,10,10,0.5)', 'transparent']}
          locations={[0, 0.3]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Info */}
      <View style={[s.info, { paddingTop: 4 }]}>
        <Text style={[s.title, { color: colors.foreground }]}>{movie.title}</Text>

        {!!movie.tagline && (
          <Text style={[s.tagline, { color: colors.mutedForeground }]}>{movie.tagline}</Text>
        )}

        {/* Meta row */}
        <View style={s.metaRow}>
          {!!year && (
            <View style={[s.badge, { backgroundColor: colors.muted }]}>
              <Text style={[s.badgeText, { color: colors.mutedForeground }]}>{year}</Text>
            </View>
          )}
          {!!runtime && (
            <View style={[s.badge, { backgroundColor: colors.muted }]}>
              <Text style={[s.badgeText, { color: colors.mutedForeground }]}>{runtime}</Text>
            </View>
          )}
          {movie.vote_average > 0 && (
            <View style={[s.badge, { backgroundColor: colors.muted }]}>
              <Text style={[s.badgeText, { color: '#f5c518' }]}>
                ★ {movie.vote_average.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Genres */}
        {movie.genres?.length > 0 && (
          <View style={s.genres}>
            {movie.genres.map((g) => (
              <View key={g.id} style={[s.genre, { borderColor: colors.border }]}>
                <Text style={[s.genreText, { color: colors.mutedForeground }]}>{g.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View style={s.actions}>
          <Pressable
            style={({ pressed }) => [
              s.playBtn,
              { backgroundColor: '#fff', borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => {}}
          >
            <Feather name="play" size={18} color="#000" />
            <Text style={s.playText}>Play</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.listBtn,
              {
                backgroundColor: isInList ? colors.primary : colors.secondary,
                borderRadius: colors.radius,
                opacity: pressed || isMutating ? 0.7 : 1,
              },
            ]}
            onPress={toggleList}
            disabled={isMutating}
          >
            {isMutating ? (
              <ActivityIndicator color={isInList ? '#fff' : colors.foreground} size="small" />
            ) : (
              <>
                <Feather
                  name={isInList ? 'check' : 'plus'}
                  size={18}
                  color={isInList ? '#fff' : colors.foreground}
                />
                <Text style={[s.listText, { color: isInList ? '#fff' : colors.foreground }]}>
                  {isInList ? 'In My List' : 'My List'}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Overview */}
        {!!movie.overview && (
          <Text style={[s.overview, { color: colors.foreground }]}>{movie.overview}</Text>
        )}

        {/* Status */}
        <View style={[s.statusRow, { borderTopColor: colors.border }]}>
          <Text style={[s.statusLabel, { color: colors.mutedForeground }]}>Status</Text>
          <Text style={[s.statusValue, { color: colors.foreground }]}>{movie.status}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  info: { paddingHorizontal: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 4, letterSpacing: -0.5 },
  tagline: { fontSize: 14, fontFamily: 'Inter_400Regular', fontStyle: 'italic', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  genre: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  genreText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  playText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#000' },
  listBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  listText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  overview: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 23, marginBottom: 24 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  statusValue: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});
