import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSearchMovies, getSearchMoviesQueryKey } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { SkeletonBox } from '@/components/SkeletonLoader';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 400);
  const enabled = debouncedQuery.length >= 2;

  const { data, isLoading } = useSearchMovies(
    { q: debouncedQuery },
    { query: { enabled, queryKey: getSearchMoviesQueryKey({ q: debouncedQuery }) } },
  );

  const topPad = isWeb ? 67 : insets.top;
  const results = data?.results ?? [];

  type ResultItem = NonNullable<typeof results>[number];

  const renderItem = ({ item }: { item: ResultItem }) => {
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    return (
      <Pressable
        style={({ pressed }) => [styles.resultItem, { opacity: pressed ? 0.75 : 1 }]}
        onPress={() => {
          Haptics.selectionAsync();
          router.push(`/movie/${item.id}`);
        }}
      >
        <View style={[styles.resultPoster, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {item.poster_path ? (
            <Image
              source={{ uri: `${POSTER_BASE}${item.poster_path}` }}
              style={[styles.resultPoster, { borderRadius: colors.radius }]}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.resultNoPoster, { borderRadius: colors.radius }]}>
              <Text style={[styles.noPosterText, { color: colors.mutedForeground }]}>
                {item.title?.charAt(0) ?? '?'}
              </Text>
            </View>
          )}
        </View>
        <Text numberOfLines={1} style={[styles.resultTitle, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}>
          {item.title}
        </Text>
        {rating && (
          <Text style={[styles.resultRating, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
            ★ {rating}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.header, { paddingTop: topPad + 12, paddingBottom: 12 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.input, borderRadius: colors.radius }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Outfit_400Regular' }]}
            placeholder="Search movies..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <FlatList
          data={Array.from({ length: 6 }, (_, i) => i)}
          keyExtractor={(i) => String(i)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={() => (
            <View style={styles.resultSkeleton}>
              <SkeletonBox width="100%" height={0} style={{ aspectRatio: 2 / 3 }} borderRadius={colors.radius} />
            </View>
          )}
        />
      ) : !enabled ? (
        <View style={styles.emptyState}>
          <Ionicons name="film-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Outfit_600SemiBold' }]}>
            Find your next watch
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
            Type at least 2 characters to search
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Outfit_600SemiBold' }]}>
            No results for "{debouncedQuery}"
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
            Try a different title or keyword
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.grid, { paddingBottom: isWeb ? 84 : insets.bottom + 80 }]}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 46,
  },
  grid: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  resultItem: {
    flex: 1,
  },
  resultSkeleton: {
    flex: 1,
  },
  resultPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    overflow: 'hidden',
  },
  resultNoPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPosterText: {
    fontSize: 36,
    fontFamily: 'Outfit_700Bold',
  },
  resultTitle: {
    fontSize: 13,
    marginTop: 5,
    lineHeight: 17,
  },
  resultRating: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
