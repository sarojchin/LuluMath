import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Question } from '../game/types';
import { colors, radius, space } from '../theme';
import { Sparkles } from './Sparkles';

export type EntryStatus = 'typing' | 'correct' | 'wrong';

interface Props {
  question: Question;
  entry: string;
  status: EntryStatus;
  /** Increments on every answer attempt so animations re-fire. */
  tick: number;
}

/**
 * The equation + the child's answer, with the "satisfying" feedback:
 * a scale punch + green flash + sparkle burst on correct, a quick shake on wrong.
 */
export function AnswerCard({ question, entry, status, tick }: Props) {
  const punch = useRef(new Animated.Value(0)).current; // 0..1..0 on correct
  const shake = useRef(new Animated.Value(0)).current; // wrong wiggle
  const flash = useRef(new Animated.Value(0)).current; // bg tint 0..1
  const correctTickRef = useRef(0);

  useEffect(() => {
    if (tick === 0) return;

    if (status === 'correct') {
      correctTickRef.current += 1;
      Animated.sequence([
        Animated.spring(punch, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 14 }),
        Animated.spring(punch, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]).start();
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 90, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 420, useNativeDriver: false }),
      ]).start();
    } else if (status === 'wrong') {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [tick, status, punch, shake, flash]);

  const scale = punch.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });
  const bg = flash.interpolate({ inputRange: [0, 1], outputRange: [colors.card, colors.correctSoft] });

  const display = entry.length > 0 ? entry : '?';
  const displayColor =
    status === 'correct' ? colors.correct : status === 'wrong' ? colors.wrong : colors.ink;

  return (
    <Animated.View style={[styles.card, { backgroundColor: bg, transform: [{ translateX }] }]}>
      <Sparkles trigger={status === 'correct' ? correctTickRef.current : 0} />
      <View style={styles.row}>
        <Text style={styles.equation}>
          {question.table} × {question.multiplier} ={'  '}
        </Text>
        <Animated.Text style={[styles.answer, { color: displayColor, transform: [{ scale }] }]}>
          {display}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    paddingVertical: space(4),
    paddingHorizontal: space(3),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equation: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.ink,
  },
  answer: {
    fontSize: 48,
    fontWeight: '900',
    minWidth: 70,
    textAlign: 'left',
  },
});
