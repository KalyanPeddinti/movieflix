import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { MovieCard, MovieCardSkeleton } from './MovieCard';
import type { Movie } from '@workspace/api-client-react';

const SKELETONS = Array.from({ length: 6 }, (_, i) => i);

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLoading: boolean;
}

export function MovieRow({ title, movies, isLoading }: MovieRowProps) {
  const colors = useColors();

  return (
    <View style={s.container}>
      <Text style={[s.title, { color: colors.foreground }]}>{title}</Text>
      {isLoading ? (
        <FlatList
          horizontal
          data={SKELETONS}
          keyExtractor={(i) => String(i)}
          renderItem={() => <MovieCardSkeleton />}
          contentContainerStyle={s.list}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          horizontal
          data={movies}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item }) => <MovieCard movie={item} />}
          contentContainerStyle={s.list}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!!movies.length}
          ListEmptyComponent={
            <Text style={[s.empty, { color: colors.mutedForeground }]}>No movies found</Text>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 10, paddingHorizontal: 16 },
  list: { paddingHorizontal: 16 },
  empty: { fontSize: 14, fontFamily: 'Inter_400Regular', paddingVertical: 20 },
});
