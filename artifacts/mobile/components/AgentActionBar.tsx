import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Colors from "@/constants/colors";
import type { SettingTopic, SettingsGuide } from "@/constants/settingsGuides";
import type { AgentAction } from "@/lib/agent";
import { detectActions, executeAction, getActionIcon, getActionLabel } from "@/lib/agent";

interface Props {
  topic: string;
  guide: SettingsGuide | null;
  onShowGuide: () => void;
}

export default function AgentActionBar({ topic, guide, onShowGuide }: Props) {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const actions = detectActions(topic);
  const [runningAction, setRunningAction] = useState<AgentAction | null>(null);
  const [doneActions, setDoneActions] = useState<Set<AgentAction>>(new Set());

  if (actions.length === 0 && !guide) return null;

  async function handleAction(action: AgentAction) {
    if (runningAction) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunningAction(action);
    const ok = await executeAction(action);
    setRunningAction(null);
    if (ok) setDoneActions((s) => new Set([...s, action]));
  }

  const primaryActions = actions.slice(0, 2);

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="flash" size={14} color={Colors.primary} />
        <Text style={[styles.sectionLabel, { color: Colors.primary, fontFamily: "Inter_600SemiBold" }]}>
          Quick Actions
        </Text>
      </View>

      <View style={styles.btnRow}>
        {/* Visual Guide button */}
        {guide && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onShowGuide();
            }}
            style={({ pressed }) => [
              styles.btn,
              styles.guideBtn,
              {
                backgroundColor: isDark ? Colors.dark.surface : "#EBF3FB",
                borderColor: isDark ? Colors.dark.border : "#C8E0F5",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons name="phone-portrait-outline" size={16} color={Colors.primary} />
            <Text style={[styles.btnLabel, { color: Colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              Show Me (Visual)
            </Text>
          </Pressable>
        )}

        {/* Agent action buttons */}
        {primaryActions.map((action) => {
          const isDone = doneActions.has(action);
          const isRunning = runningAction === action;
          const label = isDone ? "Done ✓" : getActionLabel(action);
          const icon = isDone ? "checkmark-circle" : (getActionIcon(action) as any);
          return (
            <Pressable
              key={action}
              onPress={() => handleAction(action)}
              disabled={!!runningAction || isDone}
              style={({ pressed }) => [
                styles.btn,
                styles.actionBtn,
                {
                  backgroundColor: isDone ? Colors.success : Colors.primary,
                  opacity: pressed ? 0.85 : isDone ? 0.75 : 1,
                },
              ]}
            >
              {isRunning ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name={icon} size={16} color="#fff" />
              )}
              <Text
                style={[
                  styles.btnLabel,
                  { color: "#fff", fontFamily: "Inter_600SemiBold" },
                ]}
                numberOfLines={1}
              >
                {isRunning ? "Opening..." : label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  btnRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    minWidth: 130,
  },
  guideBtn: {
    borderWidth: 1.5,
  },
  actionBtn: {},
  btnLabel: {
    fontSize: 13,
    flex: 1,
  },
});
