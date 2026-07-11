import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSearchMovies } from '@workspace/api-client-react';
import type { Movie } from '@workspace/api-client-react';

const { width } = Dimensions.get('window');
const COLS = 3;
const CARD_GAP = 2;
const CARD_W = (width - CARD_GAP * (COLS + 1)) / COLS;
const CARD_H = CARD_W * 1.5;

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearchMovies(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 1 } },
  );

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const renderItem = ({ item }: { item: Movie }) => {
    const url = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
    return (
      <Pressable
        style={({ pressed }) => [s.resultCard, { opacity: pressed ? 0.7 : 1 }]}
        onPress={() => router.push(`/movie/${item.id}`)}
      >
        {url ? (
          <Image source={{ uri: url }} style={s.poster} contentFit="cover" transition={200} />
        ) : (
          <View style={[s.poster, s.placeholder, { backgroundColor: colors.muted }]}>
            <Text style={[s.placeholderText, { color: colors.mutedForeground }]} numberOfLines={3}>
              {item.title}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[s.header, { paddingTop: topPad + 12 }]}>
        <View style={[s.searchBar, { backgroundColor: colors.input, borderRadius: colors.radius }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[s.searchInput, { color: colors.foreground }]}
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
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {debouncedQuery.length > 1 && isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : debouncedQuery.length > 1 && data ? (
        <FlatList
          data={data.results}
          keyExtractor={(m) => String(m.id)}
          numColumns={COLS}
          renderItem={renderItem}
          contentContainerStyle={{ padding: CARD_GAP }}
          columnWrapperStyle={{ gap: CARD_GAP, marginBottom: CARD_GAP }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.center}>
              <Feather name="film" size={40} color={colors.mutedForeground} />
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>No results found</Text>
            </View>
          }
        />
      ) : (
        <View style={s.center}>
          <Feather name="search" size={48} color={colors.muted} />
          <Text style={[s.hint, { color: colors.mutedForeground }]}>
            Search for any movie
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 80 },
  hint: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  resultCard: { width: CARD_W, height: CARD_H },
  poster: { width: '100%', height: '100%' },
  placeholder: { justifyContent: 'center', alignItems: 'center', padding: 8 },
  placeholderText: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
