import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import { SkeletonBox } from '@/components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 500;
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780';

interface HeroBannerMovie {
  id: number;
  title: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  vote_average?: number | null;
  overview?: string;
}

interface HeroBannerProps {
  movie: HeroBannerMovie | null;
  isLoading?: boolean;
}

export function HeroBanner({ movie, isLoading }: HeroBannerProps) {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { isInList, addToList, removeFromList } = useWatchlist();

  if (isLoading || !movie) {
    return (
      <SkeletonBox width={SCREEN_WIDTH} height={BANNER_HEIGHT} borderRadius={0} />
    );
  }

  const backdropUri = movie.backdrop_path
    ? `${BACKDROP_BASE}${movie.backdrop_path}`
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const inList = isInList(movie.id);

  const handleWatchlistTap = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
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
        release_date: '',
      });
    }
  };

  return (
    <View style={styles.container}>
      {backdropUri ? (
        <Image
          source={{ uri: backdropUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.muted }]} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(10,10,10,0.6)', colors.background]}
        locations={[0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {(movie.vote_average ?? 0) > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={[styles.ratingText, { color: '#FFD700', fontFamily: 'Outfit_600SemiBold' }]}>
              {movie.vote_average!.toFixed(1)}
            </Text>
          </View>
        )}

        <Text style={[styles.title, { color: '#fff', fontFamily: 'Outfit_700Bold' }]} numberOfLines={2}>
          {movie.title}
        </Text>

        {movie.overview ? (
          <Text style={[styles.overview, { color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit_400Regular' }]} numberOfLines={2}>
            {movie.overview}
          </Text>
        ) : null}

        <View style={styles.buttons}>
          <Pressable
            onPress={() => router.push(`/movie/${movie.id}`)}
            style={({ pressed }) => [
              styles.playButton,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={[styles.playText, { fontFamily: 'Outfit_600SemiBold' }]}>Play</Text>
          </Pressable>

          <Pressable
            onPress={handleWatchlistTap}
            style={({ pressed }) => [
              styles.listButton,
              {
                backgroundColor: inList ? colors.secondary : 'rgba(255,255,255,0.15)',
                borderColor: inList ? colors.border : 'rgba(255,255,255,0.4)',
                borderRadius: colors.radius,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons name={inList ? 'checkmark' : 'add'} size={16} color="#fff" />
            <Text style={[styles.listText, { color: '#fff', fontFamily: 'Outfit_500Medium' }]}>
              My List
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
  overview: {
    fontSize: 13,
    lineHeight: 19,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 6,
  },
  playText: {
    color: '#fff',
    fontSize: 15,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  listText: {
    fontSize: 14,
  },
});
