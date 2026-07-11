import React from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/context/WatchlistContext';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export default function MyListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const { user } = useAuth();
  const { items, removeFromList, isLoading } = useWatchlist();

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 84 : insets.bottom + 80;

  if (!user) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.centerContent, { paddingTop: topPad }]}>
          <Ionicons name="bookmark-outline" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Outfit_700Bold' }]}>
            Your watchlist is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
            Sign in to save movies you want to watch
          </Text>
          <Pressable
            onPress={() => router.push('/auth/login')}
            style={({ pressed }) => [
              styles.signInButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.signInText, { fontFamily: 'Outfit_600SemiBold' }]}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.centerContent, { paddingTop: topPad }]}>
          <Ionicons name="bookmark-outline" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Outfit_700Bold' }]}>
            Nothing saved yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
            Tap + My List on any movie to save it here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => String(item.tmdb_id)}
        contentContainerStyle={[
          styles.grid,
          { paddingTop: topPad + 8, paddingBottom: bottomPad },
        ]}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push(`/movie/${item.tmdb_id}`);
            }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.poster, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              {item.poster_path ? (
                <Image
                  source={{ uri: `${POSTER_BASE}${item.poster_path}` }}
                  style={[styles.poster, { borderRadius: colors.radius }]}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.noPoster, { borderRadius: colors.radius }]}>
                  <Text style={[styles.noPosterText, { color: colors.mutedForeground }]}>
                    {item.title?.charAt(0) ?? '?'}
                  </Text>
                </View>
              )}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  removeFromList(item.tmdb_id);
                }}
                style={styles.removeBtn}
                hitSlop={8}
              >
                <View style={styles.removeBtnInner}>
                  <Ionicons name="close" size={14} color="#fff" />
                </View>
              </Pressable>
            </View>
            <Text
              numberOfLines={2}
              style={[styles.title, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}
            >
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  signInButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInText: {
    color: '#fff',
    fontSize: 15,
  },
  grid: {
    padding: 12,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  item: {
    flex: 1,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    overflow: 'hidden',
    position: 'relative',
  },
  noPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPosterText: {
    fontSize: 36,
    fontFamily: 'Outfit_700Bold',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  removeBtnInner: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    marginTop: 5,
    lineHeight: 17,
  },
});
