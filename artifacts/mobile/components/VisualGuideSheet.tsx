import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import Colors from "@/constants/colors";
import type { SettingTopic, SettingsGuide } from "@/constants/settingsGuides";
import PhoneScreenMockup from "./PhoneScreenMockup";
import type { UiStyle } from "@/lib/deviceInfo";

interface Props {
  guide: SettingsGuide;
  visible: boolean;
  onClose: () => void;
}

export default function VisualGuideSheet({ guide, visible, onClose }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const step = guide.steps[activeStep];
  const total = guide.steps.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.sheet,
          { backgroundColor: isDark ? Colors.dark.background : "#F7F9FC" },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: isDark ? Colors.dark.border : Colors.light.border },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.cameraIcon}>
              <Ionicons name="phone-portrait" size={18} color="#fff" />
            </View>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.text, fontFamily: "Inter_700Bold" },
              ]}
            >
              {guide.heading}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Step selector dots */}
        <View style={styles.stepDots}>
          {guide.steps.map((_, i) => (
            <Pressable key={i} onPress={() => setActiveStep(i)}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === activeStep
                        ? Colors.primary
                        : isDark
                        ? Colors.dark.border
                        : "#D1D1D6",
                    width: i === activeStep ? 20 : 8,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Step label */}
          <Animated.View
            key={`step-label-${activeStep}`}
            entering={FadeInDown.springify()}
          >
            <View style={styles.stepBadge}>
              <Text
                style={[styles.stepBadgeText, { fontFamily: "Inter_600SemiBold" }]}
              >
                Step {activeStep + 1} of {total}
              </Text>
            </View>

            {/* Caption */}
            <Text
              style={[
                styles.caption,
                { color: colors.text, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {step.caption}
            </Text>
          </Animated.View>

          {/* Phone mockup */}
          <Animated.View
            key={`mockup-${activeStep}`}
            entering={FadeInUp.delay(100).springify()}
            style={styles.mockupWrap}
          >
            <PhoneScreenMockup screen={step} uiStyle={guide.uiStyle} />
          </Animated.View>

          {/* Tap hint */}
          <View style={styles.tapHint}>
            <Ionicons name="finger-print" size={16} color={Colors.primary} />
            <Text
              style={[
                styles.tapHintText,
                { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
              ]}
            >
              The highlighted area shows where to tap
            </Text>
          </View>
        </ScrollView>

        {/* Navigation buttons */}
        <View
          style={[
            styles.navBar,
            {
              backgroundColor: isDark ? Colors.dark.background : "#F7F9FC",
              borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
            },
          ]}
        >
          <Pressable
            onPress={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            style={({ pressed }) => [
              styles.navBtn,
              {
                backgroundColor:
                  activeStep === 0
                    ? isDark
                      ? Colors.dark.surface
                      : "#E5E5EA"
                    : isDark
                    ? Colors.dark.surface
                    : "#EBF3FB",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={activeStep === 0 ? "#C7C7CC" : Colors.primary}
            />
            <Text
              style={[
                styles.navBtnLabel,
                {
                  color: activeStep === 0 ? "#C7C7CC" : Colors.primary,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              Previous
            </Text>
          </Pressable>

          {activeStep < total - 1 ? (
            <Pressable
              onPress={() => setActiveStep((s) => Math.min(total - 1, s + 1))}
              style={({ pressed }) => [
                styles.navBtn,
                styles.navBtnPrimary,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.navBtnLabel,
                  { color: "#fff", fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Next Step
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.navBtn,
                { backgroundColor: Colors.success, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text
                style={[
                  styles.navBtnLabel,
                  { color: "#fff", fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Done!
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cameraIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  stepBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  stepBadgeText: {
    color: Colors.primary,
    fontSize: 13,
  },
  caption: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 6,
  },
  mockupWrap: {
    borderRadius: 20,
    overflow: "hidden",
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  tapHintText: {
    fontSize: 13,
  },
  navBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#EBF3FB",
  },
  navBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  navBtnLabel: {
    fontSize: 15,
  },
});
