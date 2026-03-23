import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import Colors from "@/constants/colors";
import type { MockupItem, StepScreen } from "@/constants/settingsGuides";
import type { UiStyle } from "@/lib/deviceInfo";

// ─── theme per OS style ───────────────────────────────────────────────────────
interface Theme {
  statusBg: string;
  headerBg: string;
  headerText: string;
  bodyBg: string;
  cellBg: string;
  cellBorder: string;
  rowHighlightBg: string;
  rowHighlightBorder: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  toggleOnColor: string;
  searchBg: string;
  borderRadius: number;
  headerFontWeight: "700" | "600" | "500";
}

const THEMES: Record<UiStyle, Theme> = {
  ios: {
    statusBg: "#1C1C1E",
    headerBg: "#F2F2F7",
    headerText: "#1C1C1E",
    bodyBg: "#F2F2F7",
    cellBg: "#FFFFFF",
    cellBorder: "#E5E5EA",
    rowHighlightBg: "#EBF3FB",
    rowHighlightBorder: "#1B6CA8",
    accent: "#1B6CA8",
    textPrimary: "#1C1C1E",
    textSecondary: "#8E8E93",
    toggleOnColor: "#34C759",
    searchBg: "#E5E5EA",
    borderRadius: 10,
    headerFontWeight: "700",
  },
  samsung: {
    statusBg: "#1259BF",
    headerBg: "#1259BF",
    headerText: "#FFFFFF",
    bodyBg: "#F4F4F4",
    cellBg: "#FFFFFF",
    cellBorder: "#E8E8E8",
    rowHighlightBg: "#EAF2FF",
    rowHighlightBorder: "#1259BF",
    accent: "#1259BF",
    textPrimary: "#1C1C1E",
    textSecondary: "#888888",
    toggleOnColor: "#1259BF",
    searchBg: "#EBEBEB",
    borderRadius: 16,
    headerFontWeight: "600",
  },
  pixel: {
    statusBg: "#202124",
    headerBg: "#FFFFFF",
    headerText: "#202124",
    bodyBg: "#F8F8F8",
    cellBg: "#FFFFFF",
    cellBorder: "#E0E0E0",
    rowHighlightBg: "#E8F0FE",
    rowHighlightBorder: "#1A73E8",
    accent: "#1A73E8",
    textPrimary: "#202124",
    textSecondary: "#5F6368",
    toggleOnColor: "#1A73E8",
    searchBg: "#F1F3F4",
    borderRadius: 8,
    headerFontWeight: "500",
  },
  android: {
    statusBg: "#202124",
    headerBg: "#FFFFFF",
    headerText: "#202124",
    bodyBg: "#F8F8F8",
    cellBg: "#FFFFFF",
    cellBorder: "#E0E0E0",
    rowHighlightBg: "#E8F0FE",
    rowHighlightBorder: "#1A73E8",
    accent: "#1A73E8",
    textPrimary: "#202124",
    textSecondary: "#5F6368",
    toggleOnColor: "#1A73E8",
    searchBg: "#F1F3F4",
    borderRadius: 8,
    headerFontWeight: "500",
  },
};

// ─── constants ────────────────────────────────────────────────────────────────
const ITEM_H = 50;

// ─── sub-components ───────────────────────────────────────────────────────────
function Toggle({ on, color }: { on: boolean; color: string }) {
  return (
    <View style={[styles.toggle, { backgroundColor: on ? color : "#C7C7CC" }]}>
      <View style={[styles.toggleKnob, { alignSelf: on ? "flex-end" : "flex-start" }]} />
    </View>
  );
}

function SettingsRow({
  item,
  index,
  highlightedIndex,
  theme,
}: {
  item: MockupItem;
  index: number;
  highlightedIndex: number;
  theme: Theme;
}) {
  const isHighlighted = index === highlightedIndex;
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isHighlighted) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.03, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true
      );
    }
  }, [isHighlighted]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View
      style={[
        styles.row,
        {
          height: ITEM_H,
          backgroundColor: isHighlighted ? theme.rowHighlightBg : theme.cellBg,
          borderBottomColor: theme.cellBorder,
          borderLeftWidth: isHighlighted ? 3 : 0,
          borderLeftColor: theme.rowHighlightBorder,
        },
        animStyle,
      ]}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: `${theme.accent}18`, borderRadius: 6 }]}>
        <Ionicons name={item.icon as any} size={16} color={isHighlighted ? theme.accent : "#666"} />
      </View>
      <Text
        style={[
          styles.rowLabel,
          {
            color: isHighlighted ? theme.accent : theme.textPrimary,
            fontWeight: isHighlighted ? "700" : "400",
          },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {item.detail && !item.hasToggle && (
        <Text style={[styles.rowDetail, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.detail}
        </Text>
      )}
      {item.hasToggle && <Toggle on={item.toggleOn ?? false} color={theme.toggleOnColor} />}
      {item.hasArrow && !item.hasToggle && (
        <Ionicons name="chevron-forward" size={13} color={theme.textSecondary} />
      )}
    </Animated.View>
  );
}

function SliderMockup({
  value,
  highlighted,
  theme,
}: {
  value: number;
  highlighted: boolean;
  theme: Theme;
}) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (highlighted) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.03, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true
      );
    }
  }, [highlighted]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View
      style={[
        styles.sliderWrap,
        highlighted && { borderWidth: 1.5, borderColor: theme.accent, backgroundColor: theme.rowHighlightBg },
        animStyle,
      ]}
    >
      <Ionicons name="sunny-outline" size={15} color={theme.textSecondary} />
      <View style={[styles.sliderTrack, { backgroundColor: "#D1D1D6" }]}>
        <View style={[styles.sliderFill, { width: `${value * 100}%`, backgroundColor: theme.accent }]} />
        <View style={[styles.sliderThumb, { left: `${value * 100}%` as any }]} />
      </View>
      <Ionicons name="sunny" size={19} color={highlighted ? theme.accent : theme.textSecondary} />
    </Animated.View>
  );
}

function PulsingRing({ highlightedIndex, theme }: { highlightedIndex: number; theme: Theme }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 700 }), withTiming(0.8, { duration: 700 })),
      -1,
      true
    );
  }, [highlightedIndex]);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const top = 52 + highlightedIndex * ITEM_H + ITEM_H / 2 - 18;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { top, borderColor: Colors.danger, backgroundColor: `${Colors.danger}22` }, ringStyle]}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PhoneScreenMockup({
  screen,
  uiStyle = "ios",
}: {
  screen: StepScreen;
  uiStyle?: UiStyle;
}) {
  const theme = THEMES[uiStyle];
  const isSamsungDarkHeader = uiStyle === "samsung";

  return (
    <View style={[styles.phoneFrame, { backgroundColor: theme.bodyBg }]}>
      {/* status bar */}
      <View style={[styles.statusBar, { backgroundColor: theme.statusBg }]}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={11} color="#fff" />
          <Ionicons name="wifi" size={11} color="#fff" style={{ marginHorizontal: 3 }} />
          <Ionicons name="battery-full" size={13} color="#fff" />
        </View>
      </View>

      {/* screen header */}
      <View
        style={[
          styles.screenHeader,
          {
            backgroundColor: theme.headerBg,
            borderBottomColor: isSamsungDarkHeader ? theme.headerBg : theme.cellBorder,
          },
        ]}
      >
        {screen.showBack && (
          <View style={styles.backBtn}>
            {uiStyle === "ios" ? (
              <>
                <Ionicons name="chevron-back" size={16} color={theme.accent} />
                <Text style={[styles.backLabel, { color: theme.accent }]}>Back</Text>
              </>
            ) : (
              <Ionicons name="arrow-back" size={20} color={isSamsungDarkHeader ? "#fff" : theme.accent} />
            )}
          </View>
        )}
        <Text
          style={[
            styles.screenTitle,
            {
              color: isSamsungDarkHeader ? "#fff" : theme.headerText,
              fontWeight: theme.headerFontWeight,
            },
            screen.showBack ? styles.screenTitleCentered : styles.screenTitleLeft,
          ]}
        >
          {screen.title}
        </Text>
      </View>

      {/* search bar */}
      {screen.showSearch && (
        <View style={[styles.searchBar, { backgroundColor: theme.searchBg, borderRadius: theme.borderRadius }]}>
          <Ionicons name="search" size={12} color={theme.textSecondary} />
          <Text style={[styles.searchText, { color: theme.textSecondary }]}>Search</Text>
        </View>
      )}

      {/* items */}
      <View
        style={[
          styles.itemList,
          {
            backgroundColor: theme.cellBg,
            borderTopColor: theme.cellBorder,
            borderBottomColor: theme.cellBorder,
          },
        ]}
      >
        {screen.items.map((item, i) => (
          <SettingsRow
            key={i}
            item={item}
            index={i}
            highlightedIndex={screen.highlightedIndex}
            theme={theme}
          />
        ))}
      </View>

      {/* slider */}
      {screen.hasSlider && (
        <SliderMockup
          value={screen.sliderValue ?? 0.5}
          highlighted={screen.sliderHighlighted ?? false}
          theme={theme}
        />
      )}

      {/* pulsing ring overlay */}
      {!screen.hasSlider && (
        <PulsingRing highlightedIndex={screen.highlightedIndex} theme={theme} />
      )}
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  phoneFrame: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D1D6",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statusBar: {
    height: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  statusTime: { color: "#fff", fontSize: 11, fontWeight: "700" },
  statusIcons: { flexDirection: "row", alignItems: "center" },
  screenHeader: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { flexDirection: "row", alignItems: "center", marginRight: 4 },
  backLabel: { fontSize: 13 },
  screenTitle: { fontSize: 16, color: "#1C1C1E" },
  screenTitleLeft: {},
  screenTitleCentered: { flex: 1, textAlign: "center", marginRight: 40 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  searchText: { fontSize: 12 },
  itemList: {
    marginTop: 8,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  rowIconWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rowLabel: { flex: 1, fontSize: 13, color: "#1C1C1E" },
  rowDetail: { fontSize: 11, marginRight: 4 },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  sliderWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 10,
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  sliderTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: "visible",
    position: "relative",
  },
  sliderFill: { height: "100%", borderRadius: 3 },
  sliderThumb: {
    position: "absolute",
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#C6C6C8",
    marginLeft: -10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ring: {
    position: "absolute",
    left: "50%",
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
  },
});
