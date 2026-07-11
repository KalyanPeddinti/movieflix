import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import type { Movie } from '@workspace/api-client-react';

const CARD_WIDTH = 110;
const CARD_HEIGHT = 165;

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const colors = useColors();
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <Pressable
      style={({ pressed }) => [s.card, { opacity: pressed ? 0.75 : 1 }]}
      onPress={() => router.push(`/movie/${movie.id}`)}
    >
      {posterUrl ? (
        <Image
          source={{ uri: posterUrl }}
          style={[s.poster, { borderRadius: colors.radius }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            s.poster,
            s.placeholder,
            { backgroundColor: colors.muted, borderRadius: colors.radius },
          ]}
        >
          <Text style={[s.placeholderText, { color: colors.mutedForeground }]} numberOfLines={3}>
            {movie.title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Skeleton version for loading state
export function MovieCardSkeleton() {
  const colors = useColors();
  return (
    <View
      style={[
        s.card,
        s.poster,
        { backgroundColor: colors.muted, borderRadius: colors.radius },
      ]}
    />
  );
}

const s = StyleSheet.create({
  card: { width: CARD_WIDTH, marginRight: 10 },
  poster: { width: CARD_WIDTH, height: CARD_HEIGHT },
  placeholder: { justifyContent: 'center', alignItems: 'center', padding: 8 },
  placeholderText: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
