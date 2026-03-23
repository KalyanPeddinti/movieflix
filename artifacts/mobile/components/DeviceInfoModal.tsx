import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Colors from "@/constants/colors";

export interface ManualDeviceInfo {
  model: string;
  manufacturer: string;
  osName: string;
  osVersion: string;
}

interface Props {
  visible: boolean;
  onComplete: (info: ManualDeviceInfo) => void;
}

const HOW_TO_FIND = [
  {
    brand: "Samsung",
    icon: "📱" as const,
    steps: [
      "Open Settings",
      'Scroll to "About phone"',
      'Tap "Software information"',
      'Note "Android version" (e.g. 14)',
      "Your model is shown at the top (e.g. Galaxy S24 Ultra)",
    ],
  },
  {
    brand: "Google Pixel",
    icon: "🔵" as const,
    steps: [
      "Open Settings",
      'Tap "About phone"',
      "Model shown at the top (e.g. Pixel 8 Pro)",
      'Tap "Android version" for the full number',
    ],
  },
  {
    brand: "Other Android",
    icon: "🤖" as const,
    steps: [
      "Open Settings",
      'Scroll to "About phone" or "About device"',
      "Model name is shown at the top",
      'Look for "Android version" or "Software info"',
    ],
  },
  {
    brand: "iPhone",
    icon: "🍎" as const,
    steps: [
      "Open Settings",
      'Tap "General" → "About"',
      'Look for "Model Name" (e.g. iPhone 15 Pro)',
      'Look for "iOS Version" (e.g. 17.3)',
    ],
  },
];

function inferManufacturer(model: string): string {
  const t = model.toLowerCase();
  if (t.includes("samsung") || t.includes("galaxy")) return "Samsung";
  if (t.includes("pixel") || t.includes("google")) return "Google";
  if (t.includes("iphone") || t.includes("ipad") || t.includes("apple"))
    return "Apple";
  if (t.includes("oneplus") || t.includes("one plus")) return "OnePlus";
  if (t.includes("motorola") || t.includes("moto ")) return "Motorola";
  if (
    t.includes("xiaomi") ||
    t.includes("redmi") ||
    t.includes("poco")
  )
    return "Xiaomi";
  if (t.includes("oppo") || t.includes("reno") || t.includes("find x"))
    return "Oppo";
  if (t.includes("realme")) return "Realme";
  if (t.includes("vivo")) return "Vivo";
  if (t.includes("nokia")) return "Nokia";
  if (t.includes("xperia") || t.includes("sony")) return "Sony";
  if (t.includes("huawei")) return "Huawei";
  if (t.includes("honor")) return "Honor";
  return "Android";
}

function inferOsName(model: string): string {
  const t = model.toLowerCase();
  if (t.includes("iphone") || t.includes("ipad") || t.includes("ios"))
    return "iOS";
  return "Android";
}

export default function DeviceInfoModal({ visible, onComplete }: Props) {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const [model, setModel] = useState("");
  const [osVersion, setOsVersion] = useState("");
  const [showHowTo, setShowHowTo] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const trimmedModel = model.trim();
    const trimmedVersion = osVersion.trim();
    if (!trimmedModel) {
      setError("Please enter your phone model (e.g. Samsung Galaxy S24)");
      return;
    }
    if (!trimmedVersion) {
      setError("Please enter your OS version (e.g. Android 14 or iOS 17)");
      return;
    }
    setError("");
    onComplete({
      model: trimmedModel,
      manufacturer: inferManufacturer(trimmedModel),
      osName: inferOsName(trimmedModel),
      osVersion: trimmedVersion,
    });
  };

  const ready = model.trim().length > 0 && osVersion.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
        <Animated.View
          entering={FadeInUp.duration(350)}
          style={[
            styles.sheet,
            { backgroundColor: isDark ? "#1A1A2E" : "#FFFFFF" },
          ]}
        >
          {/* Handle bar */}
          <View
            style={[
              styles.handle,
              { backgroundColor: isDark ? "#444" : "#DDD" },
            ]}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Icon + Title */}
            <Animated.View entering={FadeInDown.delay(80).duration(350)}>
              <View style={styles.iconWrap}>
                <Text style={styles.iconEmoji}>📱</Text>
              </View>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontFamily: "Inter_700Bold",
                  },
                ]}
              >
                Tell me about your phone
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
                ]}
              >
                I couldn't auto-detect your device. Enter your phone details so
                I can give you accurate, step-by-step instructions.
              </Text>
            </Animated.View>

            {/* Phone model input */}
            <Animated.View entering={FadeInDown.delay(140).duration(350)}>
              <Text
                style={[
                  styles.label,
                  { color: Colors.primary, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                PHONE MODEL
              </Text>
              <TextInput
                value={model}
                onChangeText={(t) => {
                  setModel(t);
                  setError("");
                }}
                placeholder="e.g. Samsung Galaxy S24, iPhone 15, Pixel 8"
                placeholderTextColor={isDark ? "#555" : "#999"}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#252540" : "#F5F5F5",
                    borderColor: isDark
                      ? "rgba(123,97,255,0.3)"
                      : "rgba(123,97,255,0.2)",
                    color: colors.text,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                returnKeyType="next"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </Animated.View>

            {/* OS version input */}
            <Animated.View entering={FadeInDown.delay(200).duration(350)}>
              <Text
                style={[
                  styles.label,
                  { color: Colors.primary, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                OS VERSION
              </Text>
              <TextInput
                value={osVersion}
                onChangeText={(t) => {
                  setOsVersion(t);
                  setError("");
                }}
                placeholder="e.g. Android 14, iOS 17, One UI 6.1"
                placeholderTextColor={isDark ? "#555" : "#999"}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#252540" : "#F5F5F5",
                    borderColor: isDark
                      ? "rgba(123,97,255,0.3)"
                      : "rgba(123,97,255,0.2)",
                    color: colors.text,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Animated.View>

            {/* Error */}
            {error ? (
              <Text
                style={[
                  styles.error,
                  { fontFamily: "Inter_500Medium" },
                ]}
              >
                ⚠️ {error}
              </Text>
            ) : null}

            {/* How to find toggle */}
            <Animated.View entering={FadeInDown.delay(260).duration(350)}>
              <Pressable
                onPress={() => setShowHowTo((v) => !v)}
                style={({ pressed }) => [
                  styles.howToBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text
                  style={[
                    styles.howToBtnText,
                    { fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  How do I find my device model and OS version?
                </Text>
                <Ionicons
                  name={showHowTo ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={Colors.primary}
                />
              </Pressable>

              {showHowTo && (
                <View
                  style={[
                    styles.howToPanel,
                    {
                      backgroundColor: isDark
                        ? "rgba(123,97,255,0.07)"
                        : "rgba(123,97,255,0.05)",
                      borderColor: isDark
                        ? "rgba(123,97,255,0.2)"
                        : "rgba(123,97,255,0.15)",
                    },
                  ]}
                >
                  {/* Brand tabs */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabBar}
                  >
                    {HOW_TO_FIND.map((h, i) => (
                      <Pressable
                        key={i}
                        onPress={() => setActiveTab(i)}
                        style={[
                          styles.tab,
                          activeTab === i && styles.tabActive,
                        ]}
                      >
                        <Text style={styles.tabEmoji}>{h.icon}</Text>
                        <Text
                          style={[
                            styles.tabText,
                            { fontFamily: "Inter_500Medium" },
                            activeTab === i && styles.tabTextActive,
                          ]}
                        >
                          {h.brand}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* Steps */}
                  <View style={styles.stepsList}>
                    {HOW_TO_FIND[activeTab].steps.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNum}>
                          <Text
                            style={[
                              styles.stepNumText,
                              { fontFamily: "Inter_700Bold" },
                            ]}
                          >
                            {i + 1}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.stepText,
                            {
                              color: isDark ? "#C0C0D0" : "#444",
                              fontFamily: "Inter_400Regular",
                            },
                          ]}
                        >
                          {step}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Confirm button */}
            <Animated.View entering={FadeInDown.delay(320).duration(350)}>
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  {
                    backgroundColor: ready
                      ? Colors.primary
                      : isDark
                      ? "rgba(123,97,255,0.2)"
                      : "#E0E0E0",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.confirmText,
                    {
                      color: ready ? "#fff" : isDark ? "#444" : "#999",
                      fontFamily: "Inter_700Bold",
                    },
                  ]}
                >
                  Start PhoneAssist →
                </Text>
              </Pressable>
              <Text
                style={[
                  styles.disclaimer,
                  {
                    color: isDark ? "#444" : "#AAA",
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                Your device info is only used to give you accurate instructions
              </Text>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(123,97,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 20,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  error: {
    fontSize: 13,
    color: "#FF6B6B",
    marginTop: -6,
  },
  howToBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  howToBtnText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
  },
  howToPanel: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(123,97,255,0.15)",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.primary,
    backgroundColor: "rgba(123,97,255,0.1)",
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabText: {
    fontSize: 12,
    color: "#666",
  },
  tabTextActive: {
    color: Colors.primary,
  },
  stepsList: {
    padding: 14,
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(123,97,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: {
    fontSize: 10,
    color: Colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    paddingTop: 2,
  },
  confirmBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmText: {
    fontSize: 15,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 8,
  },
});
