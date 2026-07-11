import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const CARD_WIDTH = 115;
const CARD_HEIGHT = 170;

export interface MovieCardMovie {
  id: number;
  title: string;
  poster_path?: string | null;
  vote_average?: number | null;
}

interface MovieCardProps {
  movie: MovieCardMovie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(`/movie/${movie.id}`);
  };

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={[styles.posterContainer, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
        {movie.poster_path ? (
          <Image
            source={{ uri: `${POSTER_BASE}${movie.poster_path}` }}
            style={[styles.poster, { borderRadius: colors.radius }]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.noPoster, { borderRadius: colors.radius }]}>
            <Text style={[styles.noPosterText, { color: colors.mutedForeground }]}>
              {movie.title?.charAt(0) ?? '?'}
            </Text>
          </View>
        )}
        {rating && (
          <View style={[styles.ratingBadge, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={[styles.title, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}
      >
        {movie.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 10,
  },
  posterContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  poster: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  noPoster: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPosterText: {
    fontSize: 36,
    fontFamily: 'Outfit_700Bold',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 10,
    fontFamily: 'Outfit_600SemiBold',
  },
  title: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 16,
  },
});
