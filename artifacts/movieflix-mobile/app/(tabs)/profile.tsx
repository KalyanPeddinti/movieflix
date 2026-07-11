import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useWatchlist } from '@/context/WatchlistContext';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const { user, logout } = useAuth();
  const { items } = useWatchlist();

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 84 : insets.bottom + 80;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          logout();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.centered, { paddingTop: topPad + 40, paddingBottom: bottomPad }]}
      >
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.muted }]}>
          <Ionicons name="person" size={40} color={colors.mutedForeground} />
        </View>

        <Text style={[styles.guestTitle, { color: colors.foreground, fontFamily: 'Outfit_700Bold' }]}>
          Welcome to MovieFlix
        </Text>
        <Text style={[styles.guestSubtitle, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
          Sign in to save your watchlist and sync across devices
        </Text>

        <Pressable
          onPress={() => router.push('/auth/login')}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.primaryBtnText, { fontFamily: 'Outfit_600SemiBold' }]}>Sign In</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/auth/register')}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { backgroundColor: colors.secondary, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}>
            Create Account
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 20, paddingBottom: bottomPad }}
    >
      {/* Avatar */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { fontFamily: 'Outfit_700Bold' }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Outfit_700Bold' }]}>
          {user.name}
        </Text>
        <Text style={[styles.email, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
          {user.email}
        </Text>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.primary, fontFamily: 'Outfit_700Bold' }]}>
            {items.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
            Saved
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={[styles.menuSection, { borderColor: colors.border }]}>
        <Pressable
          onPress={() => router.push('/(tabs)/my-list')}
          style={({ pressed }) => [
            styles.menuItem,
            { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.foreground} />
          <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}>
            My List
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Sign out */}
      <View style={styles.logoutSection}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: 'Outfit_500Medium' }]}>
            Sign Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 32,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 6,
    marginBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initials: {
    color: '#fff',
    fontSize: 28,
  },
  name: {
    fontSize: 22,
  },
  email: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 28,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuSection: {
    marginHorizontal: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
  },
  logoutSection: {
    marginTop: 24,
    marginHorizontal: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logoutText: {
    fontSize: 15,
  },
});
