import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import type { Movie } from '@workspace/api-client-react';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.62;

interface HeroBannerProps {
  movie: Movie | null;
  isLoading: boolean;
}

export function HeroBanner({ movie, isLoading }: HeroBannerProps) {
  const colors = useColors();

  if (isLoading || !movie) {
    return <View style={[s.container, { backgroundColor: colors.muted }]} />;
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null;

  return (
    <View style={s.container}>
      {backdropUrl ? (
        <Image
          source={{ uri: backdropUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.muted }]} />
      )}

      {/* Gradient overlays */}
      <LinearGradient
        colors={['transparent', 'rgba(10,10,10,0.55)', colors.background]}
        locations={[0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(10,10,10,0.4)', 'transparent']}
        locations={[0, 0.4]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={s.content}>
        <Text style={s.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={[s.meta, { color: colors.mutedForeground }]}>
          {movie.release_date?.split('-')[0]}
          {movie.vote_average > 0 ? `  ★ ${movie.vote_average.toFixed(1)}` : ''}
        </Text>
        <Text style={[s.overview, { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={2}>
          {movie.overview}
        </Text>

        <View style={s.buttons}>
          <Pressable
            style={({ pressed }) => [
              s.playBtn,
              { borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push(`/movie/${movie.id}`)}
          >
            <Feather name="play" size={18} color="#000" />
            <Text style={s.playText}>Play</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.infoBtn,
              {
                borderRadius: colors.radius,
                borderColor: 'rgba(255,255,255,0.4)',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push(`/movie/${movie.id}`)}
          >
            <Feather name="info" size={18} color="#fff" />
            <Text style={s.infoText}>More Info</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { width, height: HERO_HEIGHT, justifyContent: 'flex-end' },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  meta: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  overview: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginBottom: 18 },
  buttons: { flexDirection: 'row', gap: 10 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  playText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#000' },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  infoText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
