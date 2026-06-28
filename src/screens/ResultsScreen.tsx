import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { stageTitle } from '../game/stages';
import { RoundResult, StageConfig } from '../game/types';
import { colors, radius, space } from '../theme';

interface Props {
  stage: StageConfig;
  result: RoundResult;
  onContinue: () => void;
}

export function ResultsScreen({ stage, result, onContinue }: Props) {
  // Animated EXP count-up for a little reward moment.
  const [shownExp, setShownExp] = useState(0);
  const pop = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 12 }).start();
    const total = result.expEarned;
    const start = Date.now();
    const dur = 700;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / dur);
      setShownExp(Math.round(total * t));
      if (t >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [result.expEarned, pop]);

  const headline = result.mastered ? 'Mastered!' : 'Good try!';
  const emoji = result.mastered ? '🌟' : '💪';

  return (
    <View style={styles.screen}>
      <Animated.Text style={[styles.emoji, { transform: [{ scale: pop }] }]}>{emoji}</Animated.Text>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.sub}>{stageTitle(stage)}</Text>

      <View style={styles.card}>
        <Stat label="Time" value={`${(result.elapsedMs / 1000).toFixed(1)}s`} ok={result.passedTime} />
        <Stat
          label="Mistakes"
          value={String(result.mistakes)}
          ok={result.passedAccuracy}
          hidden={!stage.requireNoMistakes}
        />
        <View style={styles.expRow}>
          <Text style={styles.expLabel}>EXP earned</Text>
          <Text style={styles.expValue}>+{shownExp}</Text>
        </View>
      </View>

      {!result.mastered && (
        <Text style={styles.hint}>
          {!result.passedTime ? `Beat ${Math.round(stage.timeGoalMs / 1000)}s to master it.` : ''}
          {!result.passedAccuracy ? ' No mistakes needed to master it.' : ''}
        </Text>
      )}

      <Pressable style={styles.btn} onPress={onContinue}>
        <Text style={styles.btnText}>{result.mastered ? 'Continue' : 'Try again'}</Text>
      </Pressable>
    </View>
  );
}

function Stat({
  label,
  value,
  ok,
  hidden,
}: {
  label: string;
  value: string;
  ok: boolean;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: ok ? colors.correct : colors.wrong }]}>
        {value} {ok ? '✓' : '✗'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space(3),
  },
  emoji: { fontSize: 80 },
  headline: { fontSize: 32, fontWeight: '900', color: colors.ink, marginTop: space(1) },
  sub: { fontSize: 15, color: colors.inkSoft, marginBottom: space(3) },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space(2.5),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: space(1),
  },
  statLabel: { fontSize: 16, color: colors.inkSoft },
  statValue: { fontSize: 16, fontWeight: '800' },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space(1),
    paddingTop: space(1.5),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  expLabel: { fontSize: 16, fontWeight: '700', color: colors.ink },
  expValue: { fontSize: 24, fontWeight: '900', color: colors.gold },
  hint: { marginTop: space(2), color: colors.inkSoft, textAlign: 'center', fontSize: 14 },
  btn: {
    marginTop: space(4),
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: space(2),
    paddingHorizontal: space(6),
  },
  btnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
