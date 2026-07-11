import React from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGetMyList } from '@workspace/api-client-react';
import type { WatchlistMovieItem } from '@workspace/api-client-react';

const { width } = Dimensions.get('window');
const COLS = 3;
const GAP = 2;
const CARD_W = (width - GAP * (COLS + 1)) / COLS;
const CARD_H = CARD_W * 1.5;

export default function MyListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useGetMyList();

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const renderItem = ({ item }: { item: WatchlistMovieItem }) => {
    const url = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
    return (
      <Pressable
        style={({ pressed }) => [s.card, { opacity: pressed ? 0.7 : 1 }]}
        onPress={() => router.push(`/movie/${item.tmdb_id}`)}
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
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <Text style={[s.heading, { color: colors.foreground }]}>My List</Text>
        {!!data?.items.length && (
          <Text style={[s.count, { color: colors.mutedForeground }]}>
            {data.items.length} {data.items.length === 1 ? 'movie' : 'movies'}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View style={s.center}>
          <Feather name="loader" size={32} color={colors.mutedForeground} />
        </View>
      ) : !data?.items.length ? (
        <View style={s.center}>
          <Feather name="bookmark" size={48} color={colors.muted} />
          <Text style={[s.emptyTitle, { color: colors.foreground }]}>Your list is empty</Text>
          <Text style={[s.emptySubtitle, { color: colors.mutedForeground }]}>
            Save movies to watch later
          </Text>
        </View>
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item) => String(item.id)}
          numColumns={COLS}
          renderItem={renderItem}
          contentContainerStyle={{ padding: GAP, paddingBottom: insets.bottom + 100 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  count: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 80 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginTop: 8 },
  emptySubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  card: { width: CARD_W, height: CARD_H },
  poster: { width: '100%', height: '100%' },
  placeholder: { justifyContent: 'center', alignItems: 'center', padding: 8 },
  placeholderText: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
