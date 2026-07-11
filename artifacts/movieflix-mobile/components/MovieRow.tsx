import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { MovieCard, type MovieCardMovie } from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/SkeletonLoader';

interface MovieRowProps {
  title: string;
  movies: MovieCardMovie[];
  isLoading?: boolean;
}

const SKELETONS = Array.from({ length: 6 }, (_, i) => i);

export function MovieRow({ title, movies, isLoading }: MovieRowProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Outfit_600SemiBold' }]}>
        {title}
      </Text>
      {isLoading ? (
        <FlatList
          data={SKELETONS}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={styles.list}
          renderItem={() => <MovieCardSkeleton />}
        />
      ) : (
        <FlatList
          data={movies}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <MovieCard movie={item} />}
          scrollEnabled={movies.length > 0}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
              Nothing here yet
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: 17,
    marginLeft: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  empty: {
    fontSize: 14,
    paddingVertical: 20,
  },
});
