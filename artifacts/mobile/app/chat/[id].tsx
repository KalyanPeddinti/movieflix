import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AgentActionBar from "@/components/AgentActionBar";
import VisualGuideSheet from "@/components/VisualGuideSheet";
import Colors from "@/constants/colors";
import { detectTopic, getGuideForDevice } from "@/constants/settingsGuides";
import { streamMessage, fetchConversation, translateMessages } from "@/lib/api";
import { getDeviceInfo, describeDevice, toApiPayload } from "@/lib/deviceInfo";

// ─── unique ID generator ──────────────────────────────────────────────────────
let msgCounter = 0;
function genId(): string {
  msgCounter++;
  return `m-${Date.now()}-${msgCounter}-${Math.random().toString(36).substr(2, 6)}`;
}

// ─── types ────────────────────────────────────────────────────────────────────
interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// ─── language config ──────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en-US", label: "EN", full: "English" },
  { code: "hi-IN", label: "हिं", full: "Hindi" },
  { code: "te-IN", label: "తె", full: "Telugu" },
] as const;
type LangCode = (typeof LANGUAGES)[number]["code"];

// ─── voice hook (Web Speech API) ─────────────────────────────────────────────
function useVoiceInput(lang: LangCode) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const isWebSpeechAvailable =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!isWebSpeechAvailable) {
        Alert.alert(
          "Voice Input",
          "Voice input works best on web or in the published app. Please type your request.",
          [{ text: "OK" }]
        );
        return;
      }
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognitionRef.current = recognition;
      recognition.onstart = () => { setIsListening(true); setTranscript(""); };
      recognition.onresult = (event: any) => {
        let interim = "", final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += t;
          else interim += t;
        }
        setTranscript(final || interim);
        if (final) onResult(final.trim());
      };
      recognition.onerror = () => { setIsListening(false); setTranscript(""); };
      recognition.onend = () => { setIsListening(false); };
      recognition.start();
    },
    [isWebSpeechAvailable, lang]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, startListening, stopListening };
}

// ─── TypingDot ────────────────────────────────────────────────────────────────
function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1, false
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.typingDot, style]} />;
}

function TypingIndicator({ isDark }: { isDark: boolean }) {
  return (
    <View style={[styles.typingWrap, { backgroundColor: isDark ? Colors.dark.surface : "#EBF3FB" }]}>
      <TypingDot delay={0} />
      <TypingDot delay={200} />
      <TypingDot delay={400} />
    </View>
  );
}

// ─── MicButton ───────────────────────────────────────────────────────────────
function MicButton({ isListening, onPress }: { isListening: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (isListening) {
      scale.value = withRepeat(withSequence(withSpring(1.12), withSpring(1)), -1, true);
      ringScale.value = withRepeat(withTiming(1.9, { duration: 900 }), -1, false);
      ringOpacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 300 }), withTiming(0, { duration: 600 })),
        -1, false
      );
    } else {
      scale.value = withSpring(1);
      ringScale.value = 1;
      ringOpacity.value = 0;
    }
  }, [isListening]);

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringScale.value }], opacity: ringOpacity.value }));
  const bg = isListening ? Colors.danger : Colors.primary;

  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPress(); }}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <View style={styles.micOuter}>
        <Animated.View style={[styles.micRing, { borderColor: bg }, ringStyle]} />
        <Animated.View style={[styles.micBtn, { backgroundColor: bg }, btnStyle]}>
          <Ionicons name={isListening ? "stop" : "mic"} size={20} color="#fff" />
        </Animated.View>
      </View>
    </Pressable>
  );
}

// ─── Language selector ────────────────────────────────────────────────────────
function LanguageBar({
  selected,
  onSelect,
  isDark,
}: {
  selected: LangCode;
  onSelect: (l: LangCode) => void;
  isDark: boolean;
}) {
  return (
    <View style={styles.langBar}>
      {LANGUAGES.map((l) => {
        const active = l.code === selected;
        return (
          <Pressable
            key={l.code}
            onPress={() => { Haptics.selectionAsync(); onSelect(l.code); }}
            style={[
              styles.langBtn,
              {
                backgroundColor: active ? Colors.primary : isDark ? Colors.dark.surface : "#EBF3FB",
                borderColor: active ? Colors.primary : isDark ? Colors.dark.border : "#C8E0F5",
              },
            ]}
          >
            <Text style={[styles.langLabel, { color: active ? "#fff" : isDark ? Colors.dark.textSecondary : Colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              {l.label}
            </Text>
            <Text style={[styles.langFull, { color: active ? "rgba(255,255,255,0.8)" : isDark ? Colors.dark.textSecondary : Colors.primary, fontFamily: "Inter_400Regular" }]}>
              {l.full}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── parseSteps ───────────────────────────────────────────────────────────────
function parseSteps(content: string) {
  const lines = content.split("\n");
  const result: Array<{ type: "text" | "step"; text: string; num?: number }> = [];
  let stepCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(\d+)[.):]\s+(.+)$/);
    if (m) {
      stepCount++;
      result.push({ type: "step", text: m[2], num: stepCount });
    } else {
      result.push({ type: "text", text: trimmed });
    }
  }
  return result;
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, isDark }: { message: LocalMessage; isDark: boolean }) {
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
            : [styles.bubbleAssistant, {
                backgroundColor: isDark ? Colors.dark.surface : "#EBF3FB",
                borderColor: isDark ? Colors.dark.border : "#D4E8F5",
              }],
        ]}
      >
        {isUser || !parsed ? (
          <Text style={[styles.bubbleText, { color: isUser ? "#fff" : colors.text, fontFamily: "Inter_400Regular" }]}>
            {message.content}
          </Text>
        ) : (
          <View style={{ gap: 6 }}>
            {parsed.map((part, i) =>
              part.type === "step" ? (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNumWrap}>
                    <Text style={styles.stepNum}>{part.num}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                    {part.text}
                  </Text>
                </View>
              ) : (
                <Text key={i} style={[styles.bubbleText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
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

// ─── suggestions ─────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Connect to Bluetooth headphones",
  "Reduce my screen brightness",
  "Set maximum volume",
  "Turn on Wi-Fi",
];

// ─── ChatScreen ───────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { id, initialPrompt } = useLocalSearchParams<{ id: string; initialPrompt?: string }>();
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
  const [selectedLang, setSelectedLang] = useState<LangCode>("en-US");
  const [guideVisible, setGuideVisible] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Get device info once
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  const devicePayload = useMemo(() => toApiPayload(deviceInfo), [deviceInfo]);

  const inputRef = useRef<TextInput>(null);
  const { isListening, transcript, startListening, stopListening } = useVoiceInput(selectedLang);

  // Detect setting topic from initial prompt or conversation title
  const settingTopic = useMemo(
    () => detectTopic(initialPrompt ?? title),
    [initialPrompt, title]
  );
  const settingsGuide = useMemo(
    () => settingTopic ? getGuideForDevice(settingTopic, deviceInfo.uiStyle) : null,
    [settingTopic, deviceInfo.uiStyle]
  );

  // Load existing conversation
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

  // Auto-send initial prompt
  useEffect(() => {
    if (initialPrompt && !initialSent && messages.length === 0) {
      setInitialSent(true);
      handleSend(initialPrompt);
    }
  }, [initialPrompt, initialSent, messages.length]);

  // Sync interim transcript to input field
  useEffect(() => {
    if (isListening && transcript) setInput(transcript);
  }, [isListening, transcript]);

  const handleMicPress = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setInput("");
      startListening((finalText) => {
        setInput(finalText);
        inputRef.current?.focus();
      });
    }
  }, [isListening, startListening, stopListening]);

  // ─── Language change: translate all existing assistant messages ──────────────
  const handleLangChange = useCallback(
    async (lang: LangCode) => {
      setSelectedLang(lang);
      if (isStreaming || isTranslating) return;

      const assistantMsgs = messages.filter((m) => m.role === "assistant");
      if (assistantMsgs.length === 0) return;

      setIsTranslating(true);
      try {
        const texts = assistantMsgs.map((m) => m.content);
        const translated = await translateMessages(texts, lang);

        setMessages((prev) => {
          let idx = 0;
          return prev.map((m) => {
            if (m.role === "assistant") {
              const updated = { ...m, content: translated[idx] ?? m.content };
              idx++;
              return updated;
            }
            return m;
          });
        });
      } catch {
        // silently keep original if translation fails
      } finally {
        setIsTranslating(false);
      }
    },
    [messages, isStreaming, isTranslating]
  );

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      if (isListening) stopListening();
      setInput("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const userMsg: LocalMessage = { id: genId(), role: "user", content: trimmed };
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
              setMessages((prev) => [...prev, { id: genId(), role: "assistant", content: fullContent }]);
              assistantAdded = true;
            } else {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullContent };
                return updated;
              });
            }
          },
          () => {},
          () => {
            setShowTyping(false);
            if (!assistantAdded) {
              setMessages((prev) => [
                ...prev,
                { id: genId(), role: "assistant", content: "I'm sorry, I had trouble responding. Please try again." },
              ]);
            }
          },
          devicePayload,
          selectedLang
        );
      } catch {
        setShowTyping(false);
        if (!assistantAdded) {
          setMessages((prev) => [
            ...prev,
            { id: genId(), role: "assistant", content: "I'm sorry, something went wrong. Please try again." },
          ]);
        }
      } finally {
        setIsStreaming(false);
        setShowTyping(false);
      }
    },
    [convId, isStreaming, isListening, stopListening, selectedLang]
  );

  const reversed = [...messages].reverse();
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  // Show the agent bar only after there is at least one assistant message
  const hasAssistantMsg = messages.some((m) => m.role === "assistant");

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      {/* Header */}
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
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {title}
          </Text>
          {deviceInfo.isDetected ? (
            <View style={styles.deviceBadge}>
              <Ionicons name="phone-portrait-outline" size={10} color={Colors.success} />
              <Text style={[styles.deviceBadgeText, { color: Colors.success, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                {deviceInfo.model} · {deviceInfo.osName} {deviceInfo.osVersion}
              </Text>
            </View>
          ) : (
            <Text style={[styles.headerSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              Phone Settings Helper
            </Text>
          )}
        </View>
        {/* Visual guide shortcut in header */}
        {settingsGuide && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGuideVisible(true); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [styles.guideHeaderBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="phone-portrait" size={18} color={Colors.primary} />
          </Pressable>
        )}
        <View style={[styles.aiDot, { marginLeft: settingsGuide ? 8 : 8 }]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        {/* Chat messages */}
        <FlatList
          data={reversed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} isDark={isDark} />}
          inverted={messages.length > 0}
          ListHeaderComponent={
            <>
              {showTyping && <TypingIndicator isDark={isDark} />}
              {/* Agent action bar shown below the last message (top of inverted list) */}
              {hasAssistantMsg && !isStreaming && (
                <View style={styles.agentBarWrap}>
                  <AgentActionBar
                    topic={initialPrompt ?? title}
                    guide={settingsGuide}
                    onShowGuide={() => setGuideVisible(true)}
                  />
                </View>
              )}
            </>
          }
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chatContent}
          ListFooterComponent={
            messages.length === 0 && !isStreaming ? (
              <View style={styles.emptyChat}>
                <View style={styles.heroIcon}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={40} color={Colors.primary} />
                </View>
                <Text style={[styles.heroTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  How can I help you?
                </Text>
                <Text style={[styles.heroSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  Speak or type what setting you'd like to change
                </Text>
                <View style={styles.suggestionList}>
                  {SUGGESTIONS.map((p) => (
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
                      <Text style={[styles.suggestionText, { color: Colors.primary, fontFamily: "Inter_500Medium" }]}>
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* Input area */}
        <View
          style={[
            styles.inputArea,
            {
              paddingBottom: webBottom + 8,
              backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
              borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
            },
          ]}
        >
          {/* Language selector */}
          <LanguageBar selected={selectedLang} onSelect={handleLangChange} isDark={isDark} />

          {/* Translating indicator */}
          {isTranslating && (
            <View style={[styles.listeningBanner, { backgroundColor: `${Colors.primary}12` }]}>
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.listeningText, { color: Colors.primary, fontFamily: "Inter_500Medium" }]}>
                Translating to {LANGUAGES.find((l) => l.code === selectedLang)?.full ?? "English"}…
              </Text>
            </View>
          )}

          {/* Listening indicator */}
          {!isTranslating && isListening && (
            <View style={[styles.listeningBanner, { backgroundColor: `${Colors.danger}15` }]}>
              <Ionicons name="radio" size={14} color={Colors.danger} />
              <Text style={[styles.listeningText, { color: Colors.danger, fontFamily: "Inter_500Medium" }]}>
                {LANGUAGES.find((l) => l.code === selectedLang)?.full ?? "English"} — Listening...
              </Text>
            </View>
          )}

          {/* Text input row */}
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: isDark ? Colors.dark.surface : "#F0F6FF",
                borderColor: isListening ? Colors.danger : isDark ? Colors.dark.border : Colors.light.border,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder={isListening ? "Speak now..." : "Type or speak your request..."}
              placeholderTextColor={
                isListening ? Colors.danger : isDark ? Colors.dark.textSecondary : Colors.light.textSecondary
              }
              multiline
              blurOnSubmit={false}
              onSubmitEditing={() => { handleSend(input); inputRef.current?.focus(); }}
              style={[styles.textInput, { color: colors.text, fontFamily: "Inter_400Regular" }]}
            />
            <MicButton isListening={isListening} onPress={handleMicPress} />
            <Pressable
              onPress={() => { handleSend(input); inputRef.current?.focus(); }}
              disabled={isStreaming || !input.trim()}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor: input.trim() && !isStreaming ? Colors.primary : `${Colors.primary}44`,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {isStreaming ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={17} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Visual guide modal */}
      {settingsGuide && (
        <VisualGuideSheet
          guide={settingsGuide}
          visible={guideVisible}
          onClose={() => setGuideVisible(false)}
        />
      )}
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
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
  deviceBadge: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  deviceBadgeText: { fontSize: 10 },
  guideHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  chatContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexGrow: 1,
  },
  agentBarWrap: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 12,
  },
  bubbleWrap: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  bubbleWrapUser: { justifyContent: "flex-end" },
  bubbleWrapAssistant: { justifyContent: "flex-start" },
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
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAssistant: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 16, lineHeight: 24 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
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
  stepNum: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  stepText: { fontSize: 16, lineHeight: 24, flex: 1 },
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
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
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
  heroTitle: { fontSize: 24, marginBottom: 10, textAlign: "center" },
  heroSub: { fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 24 },
  suggestionList: { width: "100%", gap: 10 },
  suggestionChip: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  suggestionText: { fontSize: 15, textAlign: "center" },

  // Input area
  inputArea: { paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, gap: 8 },
  langBar: { flexDirection: "row", gap: 8 },
  langBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  langLabel: { fontSize: 15 },
  langFull: { fontSize: 12 },
  listeningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  listeningText: { fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 110,
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 4,
  },
  micOuter: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  micRing: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
  },
  micBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
