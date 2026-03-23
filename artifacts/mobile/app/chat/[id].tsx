import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { fetch } from "expo/fetch";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { streamMessage, fetchConversation, type Message } from "@/lib/api";
import { getApiUrl } from "@/lib/query-client";

let msgCounter = 0;
function genId(): string {
  msgCounter++;
  return `m-${Date.now()}-${msgCounter}-${Math.random().toString(36).substr(2, 6)}`;
}

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.typingDot,
        style,
        { animationDelay: `${delay}ms` as any },
      ]}
    />
  );
}

function TypingIndicator({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={[
        styles.typingWrap,
        {
          backgroundColor: isDark ? Colors.dark.surface : "#EBF3FB",
        },
      ]}
    >
      <TypingDot delay={0} />
      <TypingDot delay={200} />
      <TypingDot delay={400} />
    </View>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <View style={styles.stepNumWrap}>
      <Text style={styles.stepNum}>{n}</Text>
    </View>
  );
}

function parseSteps(content: string) {
  const lines = content.split("\n");
  const result: Array<{ type: "text" | "step"; text: string; num?: number }> = [];
  let stepCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const stepMatch = trimmed.match(/^(\d+)[.):]\s+(.+)$/);
    if (stepMatch) {
      stepCount++;
      result.push({ type: "step", text: stepMatch[2], num: stepCount });
    } else {
      result.push({ type: "text", text: trimmed });
    }
  }
  return result;
}

function MessageBubble({
  message,
  isDark,
  index,
}: {
  message: LocalMessage;
  isDark: boolean;
  index: number;
}) {
  const isUser = message.role === "user";
  const colors = isDark ? Colors.dark : Colors.light;

  const parsed = isUser ? null : parseSteps(message.content);

  return (
    <Animated.View
      entering={isUser ? FadeInRight.springify() : FadeInLeft.delay(50).springify()}
      style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAssistant]}
    >
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <MaterialCommunityIcons name="robot-happy" size={18} color="#fff" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: Colors.primary }]
            : [
                styles.bubbleAssistant,
                {
                  backgroundColor: isDark ? Colors.dark.surface : "#EBF3FB",
                  borderColor: isDark ? Colors.dark.border : "#D4E8F5",
                },
              ],
        ]}
      >
        {isUser || !parsed ? (
          <Text
            style={[
              styles.bubbleText,
              {
                color: isUser ? "#fff" : colors.text,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {message.content}
          </Text>
        ) : (
          <View style={{ gap: 6 }}>
            {parsed.map((part, i) =>
              part.type === "step" ? (
                <View key={i} style={styles.stepRow}>
                  <StepNumber n={part.num!} />
                  <Text
                    style={[
                      styles.stepText,
                      { color: colors.text, fontFamily: "Inter_400Regular" },
                    ]}
                  >
                    {part.text}
                  </Text>
                </View>
              ) : (
                <Text
                  key={i}
                  style={[
                    styles.bubbleText,
                    { color: colors.text, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {part.text}
                </Text>
              )
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const VOICE_PROMPTS = [
  "Connect to Bluetooth headphones",
  "Reduce my screen brightness",
  "Set maximum volume",
  "Turn on Wi-Fi",
  "Enable Do Not Disturb",
  "Make text larger",
];

export default function ChatScreen() {
  const { id, initialPrompt } = useLocalSearchParams<{
    id: string;
    initialPrompt?: string;
  }>();
  const convId = Number(id);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [title, setTitle] = useState("ElderAssist");
  const [initialSent, setInitialSent] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchConversation(convId).then((data) => {
      setTitle(data.title);
      if (data.messages.length > 0) {
        setMessages(
          data.messages.map((m) => ({
            id: genId(),
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        );
        setInitialSent(true);
      }
    });
  }, [convId]);

  useEffect(() => {
    if (initialPrompt && !initialSent && messages.length === 0) {
      setInitialSent(true);
      handleSend(initialPrompt);
    }
  }, [initialPrompt, initialSent, messages.length]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      setInput("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const userMsg: LocalMessage = {
        id: genId(),
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setShowTyping(true);

      let fullContent = "";
      let assistantAdded = false;

      try {
        await streamMessage(
          convId,
          trimmed,
          (chunk) => {
            fullContent += chunk;
            if (!assistantAdded) {
              setShowTyping(false);
              setMessages((prev) => [
                ...prev,
                { id: genId(), role: "assistant", content: fullContent },
              ]);
              assistantAdded = true;
            } else {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullContent,
                };
                return updated;
              });
            }
          },
          () => {},
          (errMsg) => {
            setShowTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: genId(),
                role: "assistant",
                content: "I'm sorry, I had trouble responding. Please try again.",
              },
            ]);
          }
        );
      } catch {
        setShowTyping(false);
        if (!assistantAdded) {
          setMessages((prev) => [
            ...prev,
            {
              id: genId(),
              role: "assistant",
              content: "I'm sorry, something went wrong. Please try again.",
            },
          ]);
        }
      } finally {
        setIsStreaming(false);
        setShowTyping(false);
      }
    },
    [convId, isStreaming]
  );

  const reversed = [...messages].reverse();

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
            paddingTop: webTop + 10,
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            borderBottomColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color={colors.text}
          />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text, fontFamily: "Inter_600SemiBold" },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.headerSub,
              { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            Phone Settings Helper
          </Text>
        </View>
        <View style={styles.aiDot} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={reversed}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MessageBubble message={item} isDark={isDark} index={index} />
          )}
          inverted={messages.length > 0}
          ListHeaderComponent={showTyping ? <TypingIndicator isDark={isDark} /> : null}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chatContent}
          ListFooterComponent={
            messages.length === 0 && !isStreaming ? (
              <View style={styles.emptyChat}>
                <View style={styles.heroIcon}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={40} color={Colors.primary} />
                </View>
                <Text
                  style={[
                    styles.heroTitle,
                    { color: colors.text, fontFamily: "Inter_700Bold" },
                  ]}
                >
                  How can I help you?
                </Text>
                <Text
                  style={[
                    styles.heroSub,
                    { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  Tell me what setting you'd like to change on your phone, or try one of these:
                </Text>
                <View style={styles.suggestionList}>
                  {VOICE_PROMPTS.slice(0, 4).map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => handleSend(p)}
                      style={({ pressed }) => [
                        styles.suggestionChip,
                        {
                          backgroundColor: isDark ? Colors.dark.surface : "#EBF3FB",
                          borderColor: isDark ? Colors.dark.border : "#C8E0F5",
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.suggestionText,
                          { color: Colors.primary, fontFamily: "Inter_500Medium" },
                        ]}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.inputBar,
            {
              paddingBottom: webBottom + 10,
              backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
              borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: isDark ? Colors.dark.surface : "#F0F6FF",
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder="Type or speak your request..."
              placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
              multiline
              blurOnSubmit={false}
              onSubmitEditing={() => {
                handleSend(input);
                inputRef.current?.focus();
              }}
              style={[
                styles.textInput,
                { color: colors.text, fontFamily: "Inter_400Regular" },
              ]}
            />
            <Pressable
              onPress={() => {
                handleSend(input);
                inputRef.current?.focus();
              }}
              disabled={isStreaming || !input.trim()}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor:
                    input.trim() && !isStreaming ? Colors.primary : `${Colors.primary}55`,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {isStreaming ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17 },
  headerSub: { fontSize: 12, marginTop: 1 },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    marginLeft: 8,
  },
  chatContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexGrow: 1,
  },
  bubbleWrap: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  bubbleWrapUser: {
    justifyContent: "flex-end",
  },
  bubbleWrapAssistant: {
    justifyContent: "flex-start",
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  stepNum: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  typingWrap: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    marginLeft: 40,
    marginBottom: 12,
    alignSelf: "flex-start",
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyChat: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  suggestionList: {
    width: "100%",
    gap: 10,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 15,
    textAlign: "center",
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
