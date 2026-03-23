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
import DeviceInfoModal, { type ManualDeviceInfo } from "@/components/DeviceInfoModal";
import VisualGuideSheet from "@/components/VisualGuideSheet";
import Colors from "@/constants/colors";
import { detectTopic, getGuideForDevice, detectUiStyleFromText } from "@/constants/settingsGuides";
import { streamMessage, fetchConversation, translateMessages, updateConversationTitle } from "@/lib/api";
import { getDeviceInfo, describeDevice, toApiPayload } from "@/lib/deviceInfo";
import type { UiStyle } from "@/lib/deviceInfo";

// ─── unique ID generator ──────────────────────────────────────────────────────
let msgCounter = 0;
function genId(): string {
  msgCounter++;
  return `m-${Date.now()}-${msgCounter}-${Math.random().toString(36).substr(2, 6)}`;
}

// ─── Derive a smart session title from the user's first message ───────────────
function deriveTitle(text: string): string {
  // Strip common filler prefixes
  let t = text
    .replace(/^(help me|how do i|how to|can you help me|please help me|i want to|i need to|please|i have a .+ phone\.?\s*)/i, "")
    .trim();
  // Capitalise first letter of each word for short results, else title-case first word
  const words = t.split(/\s+/).filter(Boolean);
  const titled = words
    .slice(0, 5)
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
  return titled.length > 2 ? titled : text.slice(0, 30);
}

// ─── Extract a human-readable device label from text ─────────────────────────
function extractDeviceLabel(text: string, style: UiStyle): string {
  if (style === "samsung") {
    // Full "Samsung Galaxy S24 Ultra" style
    const full = text.match(/samsung\s+galaxy\s+(?:s\d+|a\d+|m\d+|z\s*(?:fold|flip)\s*\d*|note\s*\d+)\s*(?:ultra|plus|\+|fe(?:\s*5g)?)?/i);
    if (full) return full[0].replace(/\s+/g, " ").trim();
    // "Galaxy S24" / "Galaxy Z Fold 5" without Samsung prefix
    const galaxy = text.match(/galaxy\s+(?:s\d+|a\d+|m\d+|z\s*(?:fold|flip)\s*\d*|note\s*\d+)\s*(?:ultra|plus|\+|fe(?:\s*5g)?)?/i);
    if (galaxy) return `Samsung ${galaxy[0].replace(/\s+/g, " ").trim()}`;
    // Shorthand "S24 Ultra" / "Z Fold 5" / "Note 20"
    const short = text.match(/(?:s2[0-5]|z\s*(?:fold|flip)\s*\d*|note\s*(?:8|9|10|20))\s*(?:ultra|plus|\+|fe)?/i);
    if (short) return `Samsung Galaxy ${short[0].replace(/\s+/g, " ").trim()}`;
    if (/galaxy\s+tab/i.test(text)) return "Samsung Galaxy Tab";
    if (/galaxy/i.test(text)) return "Samsung Galaxy";
    return "Samsung Phone";
  }
  if (style === "ios") {
    const iphone = text.match(/iphone\s+\d+\s*(?:pro\s*(?:max)?|plus|mini)?/i);
    if (iphone) return iphone[0].replace(/\s+/g, " ").trim();
    const ipad = text.match(/ipad\s*(?:pro|air|mini)?\s*(?:\d+)?/i);
    if (ipad) return ipad[0].replace(/\s+/g, " ").trim();
    return "iPhone";
  }
  if (style === "pixel") {
    const pixel = text.match(/(?:google\s+)?pixel\s+\d+[a-z]?\s*(?:pro\s*(?:xl)?|xl|a)?/i);
    if (pixel) return pixel[0].replace(/\s+/g, " ").trim();
    return "Google Pixel";
  }
  // style === "android" — try to extract a brand+model label
  const patterns: [RegExp, string][] = [
    [/oneplus\s+\d+\s*(?:pro|ultra|t)?/i, "OnePlus"],
    [/one\s+plus\s+\d+\s*(?:pro|ultra|t)?/i, "OnePlus"],
    [/motorola\s+(?:edge|razr|moto)\s*[\w\s]*/i, "Motorola"],
    [/moto\s+[gem]\s*\d+\s*(?:plus|\+|power|play)?/i, "Motorola"],
    [/xiaomi\s+\d+\s*(?:pro|ultra|t)?/i, "Xiaomi"],
    [/redmi\s+(?:note\s+)?\d+\s*(?:pro|\+)?/i, "Xiaomi"],
    [/poco\s+[a-z]\d+\s*(?:pro|gt)?/i, "Xiaomi"],
    [/oppo\s+(?:reno|find\s*x|a|f)\s*[\w\s]*/i, "Oppo"],
    [/realme\s+[\w\s]*/i, "Realme"],
    [/vivo\s+[vyx]\d+\s*(?:pro)?/i, "Vivo"],
    [/nokia\s+[gxc]?\d+\s*(?:plus|\+)?/i, "Nokia"],
    [/(?:sony\s+)?xperia\s+[\d\w]+\s*(?:v|iv|iii|ii)?/i, "Sony"],
    [/asus\s+zenfone\s+\d+\s*(?:ultra)?/i, "ASUS"],
    [/rog\s+phone\s+\d+/i, "ASUS"],
    [/nothing\s+phone\s+(?:\d+|two|one)/i, "Nothing"],
    [/huawei\s+[pm]\d+\s*(?:pro|ultra)?/i, "Huawei"],
    [/honor\s+\d+\s*(?:pro|magic)?/i, "Honor"],
    [/infinix\s+(?:note|hot|zero)\s*\d+/i, "Infinix"],
    [/tecno\s+(?:camon|spark|pop)\s*\d+/i, "Tecno"],
  ];
  for (const [re, brand] of patterns) {
    const m = text.match(re);
    if (m) return `${brand} ${m[0].replace(new RegExp(brand, "i"), "").replace(/\s+/g, " ").trim()}`.trim();
  }
  return "Android Phone";
}

// ─── Infer manufacturer name from free text for synthetic payloads ────────────
function inferManufacturer(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("oneplus") || /one plus/.test(t)) return "OnePlus";
  if (t.includes("motorola") || /moto /.test(t)) return "Motorola";
  if (t.includes("xiaomi")) return "Xiaomi";
  if (t.includes("redmi") || t.includes("poco")) return "Xiaomi";
  if (t.includes("oppo")) return "Oppo";
  if (t.includes("realme")) return "Realme";
  if (t.includes("vivo")) return "Vivo";
  if (t.includes("nokia")) return "Nokia";
  if (t.includes("sony") || t.includes("xperia")) return "Sony";
  if (t.includes("asus") || t.includes("zenfone") || t.includes("rog phone")) return "ASUS";
  if (t.includes("nothing phone")) return "Nothing";
  if (t.includes("huawei")) return "Huawei";
  if (t.includes("honor")) return "Honor";
  if (t.includes("infinix")) return "Infinix";
  if (t.includes("tecno")) return "Tecno";
  if (t.includes("htc")) return "HTC";
  return "Android";
}

// ─── Synthetic device payload for a given UI style ───────────────────────────
function syntheticDevicePayload(style: UiStyle, mentionedLabel: string) {
  switch (style) {
    case "samsung":
      return { model: mentionedLabel, manufacturer: "Samsung", osName: "Android", osVersion: "14" };
    case "ios":
      return { model: mentionedLabel, manufacturer: "Apple", osName: "iOS", osVersion: "17" };
    case "pixel":
      return { model: mentionedLabel, manufacturer: "Google", osName: "Android", osVersion: "14" };
    default: {
      // For generic android, infer the actual manufacturer from the label text
      const mfg = inferManufacturer(mentionedLabel);
      return { model: mentionedLabel, manufacturer: mfg, osName: "Android", osVersion: "14" };
    }
  }
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
  const [title, setTitle] = useState("PhoneAssist");
  const [initialSent, setInitialSent] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LangCode>("en-US");
  const [guideVisible, setGuideVisible] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // ── Device conflict resolution ──────────────────────────────────────────────
  // chosenUiStyle: the user's explicit pick after a conflict
  const [chosenUiStyle, setChosenUiStyle] = useState<UiStyle | null>(null);
  // pendingConflict: filled when a new message mentions a different device
  const [pendingConflict, setPendingConflict] = useState<{
    mentionedStyle: UiStyle;
    mentionedLabel: string;
    savedMessage: string;     // the message waiting to be sent
  } | null>(null);

  // Get device info once; allow manual override when not auto-detected
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  const [manualDevice, setManualDevice] = useState<ManualDeviceInfo | null>(null);
  const showDeviceModal = !deviceInfo.isDetected && manualDevice === null;

  const devicePayload = useMemo(() => {
    if (manualDevice) {
      return {
        model: manualDevice.model,
        manufacturer: manualDevice.manufacturer,
        osName: manualDevice.osName,
        osVersion: manualDevice.osVersion,
      };
    }
    return toApiPayload(deviceInfo);
  }, [deviceInfo, manualDevice]);

  const inputRef = useRef<TextInput>(null);
  const { isListening, transcript, startListening, stopListening } = useVoiceInput(selectedLang);

  // Detect setting topic — user messages first (strongest signal), then assistant,
  // then fall back to title/prompt. This prevents long AI responses full of
  // incidental words like "Display" from overriding the user's actual intent.
  const settingTopic = useMemo(() => {
    const userMsgs = messages.filter((m) => m.role === "user");
    const assistantMsgs = messages.filter((m) => m.role === "assistant");
    // Check user messages newest-first
    for (const msg of [...userMsgs].reverse()) {
      const t = detectTopic(msg.content);
      if (t) return t;
    }
    // Check initialPrompt / title before falling into assistant text
    const promptTopic = detectTopic(initialPrompt ?? title);
    if (promptTopic) return promptTopic;
    // Finally scan assistant messages (lowest priority — avoid false positives)
    for (const msg of [...assistantMsgs].reverse()) {
      const t = detectTopic(msg.content);
      if (t) return t;
    }
    return null;
  }, [messages, initialPrompt, title]);

  // Detect which device/brand was mentioned in the conversation so the visual
  // guide matches what the AI is describing — NOT the device running the app.
  const mentionedUiStyle = useMemo(() => {
    // Check most recent user messages first (most explicit signal),
    // then most recent assistant messages as a secondary signal.
    const userMsgs = [...messages].filter((m) => m.role === "user").reverse();
    const assistantMsgs = [...messages].filter((m) => m.role === "assistant").reverse();
    for (const msg of [...userMsgs, ...assistantMsgs]) {
      const style = detectUiStyleFromText(msg.content);
      if (style) return style;
    }
    // Also check the initial prompt / title
    if (initialPrompt) {
      const style = detectUiStyleFromText(initialPrompt);
      if (style) return style;
    }
    return detectUiStyleFromText(title);
  }, [messages, initialPrompt, title]);

  // Priority: user's explicit choice > mentioned in chat > auto-detected device
  const effectiveUiStyle = chosenUiStyle ?? mentionedUiStyle ?? deviceInfo.uiStyle;

  const settingsGuide = useMemo(
    () => settingTopic ? getGuideForDevice(settingTopic, effectiveUiStyle) : null,
    [settingTopic, effectiveUiStyle]
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

  // ─── Core streaming send (used after conflict is resolved or no conflict) ─────
  const doStreamSend = useCallback(
    async (trimmed: string, activeDevicePayload: typeof devicePayload, isFirstMessage = false) => {
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
          activeDevicePayload,
          selectedLang
        );

        // Auto-title: after the first exchange, derive a meaningful session name
        if (isFirstMessage) {
          const newTitle = deriveTitle(trimmed);
          setTitle(newTitle);
          updateConversationTitle(convId, newTitle).catch(() => {});
        }
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
    [convId, selectedLang]
  );

  // ─── handleSend: detects conflict, pauses if needed ─────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      if (isListening) stopListening();
      setInput("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Only check for conflict when device is real (not web) and not already resolved
      if (deviceInfo.isDetected) {
        const mentionedStyle = detectUiStyleFromText(trimmed);
        const hasConflict =
          mentionedStyle !== null &&
          mentionedStyle !== deviceInfo.uiStyle &&
          mentionedStyle !== chosenUiStyle; // don't re-ask if already resolved

        if (hasConflict) {
          const mentionedLabel = extractDeviceLabel(trimmed, mentionedStyle);
          setPendingConflict({ mentionedStyle, mentionedLabel, savedMessage: trimmed });
          return; // pause — wait for user to choose
        }
      }

      // No conflict — send immediately using current effective device payload
      const activePayload = chosenUiStyle
        ? syntheticDevicePayload(chosenUiStyle, deviceInfo.model)
        : devicePayload;
      await doStreamSend(trimmed, activePayload, messages.length === 0);
    },
    [convId, isStreaming, isListening, stopListening, selectedLang, deviceInfo, chosenUiStyle, devicePayload, doStreamSend, messages]
  );

  // ─── Conflict resolution: user picked which device to use ───────────────────
  const handleConflictChoice = useCallback(
    async (resolvedStyle: UiStyle) => {
      if (!pendingConflict) return;
      const { mentionedStyle, mentionedLabel, savedMessage } = pendingConflict;

      setChosenUiStyle(resolvedStyle);
      setPendingConflict(null);

      const activePayload =
        resolvedStyle === deviceInfo.uiStyle
          ? devicePayload
          : syntheticDevicePayload(mentionedStyle, mentionedLabel);

      await doStreamSend(savedMessage, activePayload, messages.length === 0);
    },
    [pendingConflict, deviceInfo, devicePayload, doStreamSend, messages]
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
          {deviceInfo.isDetected || manualDevice ? (
            <View style={styles.deviceBadge}>
              <Ionicons name="phone-portrait-outline" size={10} color={Colors.success} />
              <Text style={[styles.deviceBadgeText, { color: Colors.success, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                {manualDevice ? manualDevice.model : deviceInfo.model} · {manualDevice ? manualDevice.osName : deviceInfo.osName} {manualDevice ? manualDevice.osVersion : deviceInfo.osVersion}
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

        {/* ── Device conflict resolution card ────────────────────────────── */}
        {pendingConflict && deviceInfo.isDetected && (
          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={[
              styles.conflictCard,
              {
                backgroundColor: isDark ? Colors.dark.surface : "#FFFBF0",
                borderColor: Colors.warning,
              },
            ]}
          >
            {/* Icon + dismiss row */}
            <View style={styles.conflictHeader}>
              <View style={styles.conflictIconWrap}>
                <Ionicons name="alert-circle" size={20} color={Colors.warning} />
              </View>
              <Text style={[styles.conflictTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                Different phone mentioned
              </Text>
              <Pressable
                onPress={() => {
                  // Restore the saved message to input on dismiss
                  setInput(pendingConflict.savedMessage);
                  setPendingConflict(null);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Description */}
            <Text style={[styles.conflictBody, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              Your phone is{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.text }}>
                {deviceInfo.model} ({deviceInfo.osName} {deviceInfo.osVersion})
              </Text>
              , but you mentioned a{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.text }}>
                {pendingConflict.mentionedLabel}
              </Text>
              .{"\n"}Which device should I give instructions for?
            </Text>

            {/* Choice buttons */}
            <View style={styles.conflictBtns}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleConflictChoice(deviceInfo.uiStyle); }}
                style={({ pressed }) => [
                  styles.conflictBtn,
                  styles.conflictBtnPrimary,
                  { backgroundColor: Colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons name="phone-portrait" size={14} color="#fff" />
                <Text style={[styles.conflictBtnText, { fontFamily: "Inter_600SemiBold", color: "#fff" }]} numberOfLines={1}>
                  My {deviceInfo.model}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleConflictChoice(pendingConflict.mentionedStyle); }}
                style={({ pressed }) => [
                  styles.conflictBtn,
                  styles.conflictBtnSecondary,
                  {
                    backgroundColor: isDark ? Colors.dark.background : "#FFF",
                    borderColor: Colors.warning,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons name="swap-horizontal" size={14} color={Colors.warning} />
                <Text style={[styles.conflictBtnText, { fontFamily: "Inter_600SemiBold", color: Colors.warning }]} numberOfLines={1}>
                  {pendingConflict.mentionedLabel}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

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

      {/* Device info modal — shown when device is not auto-detected */}
      <DeviceInfoModal
        visible={showDeviceModal}
        onComplete={(info) => setManualDevice(info)}
      />
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
  // ── Conflict card ──────────────────────────────────────────────────────────
  conflictCard: {
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  conflictHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  conflictIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.warning}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  conflictTitle: {
    flex: 1,
    fontSize: 14,
  },
  conflictBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  conflictBtns: {
    flexDirection: "row",
    gap: 8,
  },
  conflictBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  conflictBtnPrimary: {
    // backgroundColor set inline
  },
  conflictBtnSecondary: {
    borderWidth: 1.5,
  },
  conflictBtnText: {
    fontSize: 13,
  },
});
