import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const COUNT = 8; // kept small on purpose — satisfying, not overwhelming
const DOT_COLORS = [colors.gold, colors.correct, colors.primary, '#38BDF8'];

interface Props {
  /** Increment this to fire a burst. 0 = no burst yet. */
  trigger: number;
}

/** A short, contained confetti pop. Fires whenever `trigger` changes. */
export function Sparkles({ trigger }: Props) {
  const dots = useRef(
    Array.from({ length: COUNT }, (_, i) => ({
      angle: (Math.PI * 2 * i) / COUNT + Math.random() * 0.4,
      dist: 46 + Math.random() * 26,
      color: DOT_COLORS[i % DOT_COLORS.length],
      progress: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (trigger === 0) return;
    const anims = dots.map((d) => {
      d.progress.setValue(0);
      return Animated.timing(d.progress, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });
    Animated.stagger(8, anims).start();
  }, [trigger, dots]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      {dots.map((d, i) => {
        const tx = d.progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(d.angle) * d.dist] });
        const ty = d.progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(d.angle) * d.dist] });
        const scale = d.progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0.4] });
        const opacity = d.progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: d.color, opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale }] },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
