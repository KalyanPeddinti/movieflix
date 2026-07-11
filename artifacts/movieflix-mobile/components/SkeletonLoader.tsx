import React, { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonBoxProps) {
  const colors = useColors();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Use a plain View for layout (avoids reanimated DimensionValue restriction)
  // and Animated.View inside for the opacity pulse.
  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.muted }, animatedStyle]}
      />
    </View>
  );
}

export function MovieCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.cardSkeleton, { backgroundColor: colors.card }]}>
      <SkeletonBox width={115} height={170} borderRadius={8} />
      <SkeletonBox width={90} height={12} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    width: 115,
    marginRight: 10,
    gap: 6,
  },
});
