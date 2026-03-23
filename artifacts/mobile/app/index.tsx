import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import {
  fetchConversations,
  createConversation,
  deleteConversation,
  type Conversation,
} from "@/lib/api";

const QUICK_PROMPTS = [
  { icon: "bluetooth", label: "Bluetooth", prompt: "Help me connect a Bluetooth device" },
  { icon: "wifi", label: "Wi-Fi", prompt: "Help me connect to Wi-Fi" },
  { icon: "volume-high", label: "Volume", prompt: "Help me change the volume" },
  { icon: "brightness-6", label: "Brightness", prompt: "Help me adjust the screen brightness" },
  { icon: "bell-off", label: "Silent Mode", prompt: "Help me put my phone on silent mode" },
  { icon: "battery-charging", label: "Battery Saver", prompt: "Help me turn on battery saver" },
];

let convCounter = 0;
function newId() {
  convCounter++;
  return `conv-${Date.now()}-${convCounter}`;
}

function QuickPromptButton({
  icon,
  label,
  onPress,
  isDark,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.94);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={[
          styles.quickBtn,
          {
            backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={Colors.primary}
        />
        <Text
          style={[
            styles.quickBtnLabel,
            { color: colors.text, fontFamily: "Inter_500Medium" },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ConversationItem({
  item,
  onPress,
  onDelete,
  isDark,
  index,
}: {
  item: Conversation;
  onPress: () => void;
  onDelete: () => void;
  isDark: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const colors = isDark ? Colors.dark : Colors.light;
  const date = new Date(item.createdAt);
  const timeStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      exiting={FadeOut}
      style={animStyle}
    >
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={[
          styles.convItem,
          {
            backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
      >
        <View style={styles.convIconWrap}>
          <Ionicons
            name="chatbubble-ellipses"
            size={22}
            color={Colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.convTitle,
              { color: colors.text, fontFamily: "Inter_600SemiBold" },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.convDate,
              { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            {timeStr}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const colors = isDark ? Colors.dark : Colors.light;

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => createConversation(title),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      router.push({ pathname: "/chat/[id]", params: { id: String(data.id) } });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleNewChat = useCallback(
    (title = "New session") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      createMutation.mutate(title);
    },
    [createMutation]
  );

  const handleQuickPrompt = useCallback(
    (prompt: string, label: string) => {
      createMutation.mutate(label, {
        onSuccess: (data) => {
          router.push({
            pathname: "/chat/[id]",
            params: { id: String(data.id), initialPrompt: prompt },
          });
        },
      });
    },
    [createMutation]
  );

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert("Delete session?", "This will remove the conversation history.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]);
    },
    [deleteMutation]
  );

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: webTop + 12,
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            borderBottomColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.appTitle,
              { color: colors.text, fontFamily: "Inter_700Bold" },
            ]}
          >
            ElderAssist
          </Text>
          <Text
            style={[
              styles.appSubtitle,
              {
                color: colors.textSecondary,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            Your phone settings helper
          </Text>
        </View>
        <Pressable
          onPress={() => handleNewChat("New session")}
          disabled={createMutation.isPending}
          style={({ pressed }) => [
            styles.newChatBtn,
            { backgroundColor: Colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="add" size={26} color="#fff" />
          )}
        </Pressable>
      </View>

      <FlatList
        data={conversations ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <ConversationItem
            item={item}
            index={index}
            isDark={isDark}
            onPress={() =>
              router.push({
                pathname: "/chat/[id]",
                params: { id: String(item.id) },
              })
            }
            onDelete={() => handleDelete(item.id)}
          />
        )}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: webBottom + 16 },
        ]}
        ListHeaderComponent={
          <View style={styles.quickSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Quick Help
            </Text>
            <View style={styles.quickGrid}>
              {QUICK_PROMPTS.map((q) => (
                <QuickPromptButton
                  key={q.label}
                  icon={q.icon}
                  label={q.label}
                  isDark={isDark}
                  onPress={() => handleQuickPrompt(q.prompt, q.label)}
                />
              ))}
            </View>
            {(conversations?.length ?? 0) > 0 && (
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.textSecondary,
                    fontFamily: "Inter_600SemiBold",
                    marginTop: 24,
                  },
                ]}
              >
                Past Sessions
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
                ]}
              >
                Tap a quick button above or{"\n"}the + button to start a session
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  newChatBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  quickSection: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: 130,
  },
  quickBtnLabel: {
    fontSize: 14,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  convIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  convTitle: { fontSize: 15 },
  convDate: { fontSize: 12, marginTop: 2 },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
