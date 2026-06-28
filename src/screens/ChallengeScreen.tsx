import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnswerCard, EntryStatus } from '../components/AnswerCard';
import { NumberPad } from '../components/NumberPad';
import { generateQuestions } from '../game/questions';
import { evaluateRound } from '../game/scoring';
import { RoundResult, StageConfig } from '../game/types';
import { stageTitle } from '../game/stages';
import { colors, radius, space } from '../theme';
import { hapticCorrect, hapticTap, hapticWrong } from '../util/haptics';

interface Props {
  stage: StageConfig;
  isFirstMastery: boolean;
  onComplete: (result: RoundResult) => void;
  onQuit: () => void;
}

const ADVANCE_DELAY_MS = 520;
const RESET_DELAY_MS = 360;

export function ChallengeScreen({ stage, isFirstMastery, onComplete, onQuit }: Props) {
  const questions = useMemo(() => generateQuestions(stage), [stage]);
  const startRef = useRef<number>(Date.now());
  const mistakesRef = useRef(0);

  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState('');
  const [status, setStatus] = useState<EntryStatus>('typing');
  const [tick, setTick] = useState(0);
  const [streak, setStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Running clock for display. Stops once the round is locked at the end.
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
    return () => clearInterval(id);
  }, []);

  const current = questions[index];

  function handleSubmit() {
    if (locked || entry.length === 0) return;
    const value = parseInt(entry, 10);

    if (value === current.answer) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setStatus('correct');
      setTick((t) => t + 1);
      setLocked(true);
      hapticCorrect(nextStreak);

      setTimeout(() => {
        if (index + 1 >= questions.length) {
          const elapsedMs = Date.now() - startRef.current;
          onComplete(
            evaluateRound(stage, questions.length, mistakesRef.current, elapsedMs, isFirstMastery),
          );
        } else {
          setIndex((i) => i + 1);
          setEntry('');
          setStatus('typing');
          setLocked(false);
        }
      }, ADVANCE_DELAY_MS);
    } else {
      mistakesRef.current += 1;
      setStreak(0);
      setStatus('wrong');
      setTick((t) => t + 1);
      setLocked(true);
      hapticWrong();

      setTimeout(() => {
        setEntry('');
        setStatus('typing');
        setLocked(false);
      }, RESET_DELAY_MS);
    }
  }

  function handleDigit(d: number) {
    if (locked || entry.length >= 3) return;
    hapticTap();
    setEntry((e) => (e === '0' ? String(d) : e + d));
  }

  function handleBackspace() {
    if (locked) return;
    setEntry((e) => e.slice(0, -1));
  }

  const seconds = (elapsed / 1000).toFixed(1);
  const overGoal = elapsed > stage.timeGoalMs;

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={onQuit} hitSlop={12}>
          <Text style={styles.quit}>✕</Text>
        </Pressable>
        <Text style={styles.title}>{stageTitle(stage)}</Text>
        <Text style={[styles.timer, overGoal && styles.timerOver]}>{seconds}s</Text>
      </View>

      <ProgressDots total={questions.length} index={index} />

      {streak >= 2 && (
        <Text style={styles.combo}>
          🔥 {streak} in a row{streak % 5 === 0 ? '  —  combo!' : ''}
        </Text>
      )}

      <View style={styles.cardWrap}>
        <AnswerCard question={current} entry={entry} status={status} tick={tick} />
      </View>

      <View style={styles.padWrap}>
        <NumberPad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          canSubmit={entry.length > 0}
          disabled={locked}
        />
      </View>
    </View>
  );
}

function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < index && styles.dotDone,
            i === index && styles.dotCurrent,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: space(7),
    paddingHorizontal: space(2.5),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space(1.5),
  },
  quit: { fontSize: 24, color: colors.inkSoft, width: 40 },
  title: { fontSize: 16, fontWeight: '700', color: colors.inkSoft },
  timer: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    width: 56,
    textAlign: 'right',
  },
  timerOver: { color: colors.wrong },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: space(1),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.track,
  },
  dotDone: { backgroundColor: colors.correct },
  dotCurrent: { backgroundColor: colors.primary, transform: [{ scale: 1.3 }] },
  combo: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: colors.gold,
    marginBottom: space(0.5),
  },
  cardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  padWrap: {
    paddingBottom: space(4),
  },
});
