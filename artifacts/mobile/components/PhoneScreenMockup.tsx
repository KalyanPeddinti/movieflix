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

const ITEM_H = 48;
const SLIDER_Y_OFFSET = 72;

function Toggle({ on }: { on: boolean }) {
  return (
    <View
      style={[
        styles.toggle,
        { backgroundColor: on ? Colors.success : "#C7C7CC" },
      ]}
    >
      <View
        style={[styles.toggleKnob, { alignSelf: on ? "flex-end" : "flex-start" }]}
      />
    </View>
  );
}

function SettingsRow({
  item,
  index,
  highlightedIndex,
}: {
  item: MockupItem;
  index: number;
  highlightedIndex: number;
}) {
  const isHighlighted = index === highlightedIndex;
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isHighlighted) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    }
  }, [isHighlighted]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.row,
        isHighlighted && styles.rowHighlighted,
        animStyle,
      ]}
    >
      <View style={styles.rowIconWrap}>
        <Ionicons
          name={item.icon as any}
          size={18}
          color={isHighlighted ? Colors.primary : "#555"}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          isHighlighted && { color: Colors.primary, fontWeight: "700" },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {item.detail && !item.hasToggle && (
        <Text style={styles.rowDetail} numberOfLines={1}>
          {item.detail}
        </Text>
      )}
      {item.hasToggle && <Toggle on={item.toggleOn ?? false} />}
      {item.hasArrow && !item.hasToggle && (
        <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
      )}
    </Animated.View>
  );
}

function SliderMockup({ value, highlighted }: { value: number; highlighted: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (highlighted) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.04, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true
      );
    }
  }, [highlighted]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View style={[styles.sliderWrap, highlighted && styles.sliderHighlighted, animStyle]}>
      <Ionicons name="sunny-outline" size={16} color="#999" />
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${value * 100}%` }]} />
        <View style={[styles.sliderThumb, { left: `${value * 100}%` as any }]} />
      </View>
      <Ionicons name="sunny" size={20} color={highlighted ? Colors.primary : "#999"} />
    </Animated.View>
  );
}

function PulsingRing({ highlightedIndex }: { highlightedIndex: number }) {
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
      style={[
        styles.ring,
        { top },
        ringStyle,
      ]}
    />
  );
}

export default function PhoneScreenMockup({ screen }: { screen: StepScreen }) {
  const sliderTop =
    52 + screen.items.length * ITEM_H + 10;

  return (
    <View style={styles.phoneFrame}>
      {/* status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={12} color="#fff" />
          <Ionicons name="wifi" size={12} color="#fff" style={{ marginHorizontal: 3 }} />
          <Ionicons name="battery-full" size={14} color="#fff" />
        </View>
      </View>

      {/* screen header */}
      <View style={styles.screenHeader}>
        {screen.showBack && (
          <View style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={Colors.primary} />
            <Text style={[styles.backLabel, { color: Colors.primary }]}>Back</Text>
          </View>
        )}
        <Text
          style={[
            styles.screenTitle,
            screen.showBack ? styles.screenTitleCentered : styles.screenTitleLeft,
          ]}
        >
          {screen.title}
        </Text>
      </View>

      {/* search bar */}
      {screen.showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={13} color="#8E8E93" />
          <Text style={styles.searchText}>Search</Text>
        </View>
      )}

      {/* items */}
      <View style={styles.itemList}>
        {screen.items.map((item, i) => (
          <SettingsRow
            key={i}
            item={item}
            index={i}
            highlightedIndex={screen.highlightedIndex}
          />
        ))}
      </View>

      {/* slider (optional) */}
      {screen.hasSlider && (
        <SliderMockup
          value={screen.sliderValue ?? 0.5}
          highlighted={screen.sliderHighlighted ?? false}
        />
      )}

      {/* pulsing ring overlay */}
      {!screen.hasSlider && (
        <PulsingRing highlightedIndex={screen.highlightedIndex} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  phoneFrame: {
    width: "100%",
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D1D6",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  statusBar: {
    backgroundColor: "#1C1C1E",
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  statusTime: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  screenHeader: {
    backgroundColor: "#F2F2F7",
    paddingTop: 14,
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
  backLabel: {
    fontSize: 13,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  screenTitleLeft: {
    marginLeft: 0,
  },
  screenTitleCentered: {
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  searchText: {
    color: "#8E8E93",
    fontSize: 13,
  },
  itemList: {
    marginHorizontal: 0,
    marginTop: 8,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#C6C6C8",
  },
  row: {
    height: ITEM_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#fff",
  },
  rowHighlighted: {
    backgroundColor: "#EBF3FB",
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: "#1C1C1E",
  },
  rowDetail: {
    fontSize: 12,
    color: "#8E8E93",
    marginRight: 4,
  },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  sliderWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 10,
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  sliderHighlighted: {
    backgroundColor: "#EBF3FB",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    overflow: "visible",
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    top: -7,
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
    borderColor: Colors.danger,
    backgroundColor: `${Colors.danger}22`,
  },
});
