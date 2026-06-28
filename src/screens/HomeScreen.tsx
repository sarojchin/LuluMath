import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { makeStage } from '../game/questions';
import { stageGoal } from '../game/stages';
import { levelFromExp } from '../game/scoring';
import { StageConfig } from '../game/types';
import { bestTime, isMastered, nextStage, Progress } from '../state/progress';
import { colors, radius, space } from '../theme';

interface Props {
  progress: Progress;
  onPlay: (stage: StageConfig) => void;
}

export function HomeScreen({ progress, onPlay }: Props) {
  const { level, intoLevel, forNextLevel } = levelFromExp(progress.totalExp);
  const next = nextStage(progress);
  const stages = [makeStage(1, 'inOrder'), makeStage(1, 'random')];
  const allDone = next === null;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.brand}>LuluMath</Text>

      {/* Placeholder for the 3D pet (arrives in a later milestone). */}
      <View style={styles.petBubble}>
        <Text style={styles.petEmoji}>{allDone ? '🐲' : '🥚'}</Text>
      </View>
      <Text style={styles.petCaption}>
        {allDone ? 'Your pet is growing!' : 'Master tables to grow your pet'}
      </Text>

      {/* Level + EXP bar */}
      <View style={styles.levelRow}>
        <Text style={styles.level}>Lv {level}</Text>
        <View style={styles.expTrack}>
          <View
            style={[
              styles.expFill,
              { width: `${forNextLevel === 0 ? 0 : Math.min(100, (intoLevel / forNextLevel) * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.exp}>{progress.totalExp} XP</Text>
      </View>

      {/* Table 1 card with its two stages */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Table 1</Text>
        {stages.map((stage) => {
          const done = isMastered(progress, stage.table, stage.kind);
          const best = bestTime(progress, stage);
          const isNext = next !== null && next.kind === stage.kind && next.table === stage.table;
          return (
            <View key={stage.kind} style={styles.stageRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageName}>
                  {stage.kind === 'inOrder' ? 'In Order' : 'Random'} {done ? '⭐' : ''}
                </Text>
                <Text style={styles.stageGoal}>
                  {stageGoal(stage)}
                  {best !== undefined ? `  ·  Best ${(best / 1000).toFixed(1)}s` : ''}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  done ? styles.badgeDone : isNext ? styles.badgeNext : styles.badgeLocked,
                ]}
              >
                <Text style={styles.badgeText}>
                  {done ? 'Mastered' : isNext ? 'Up next' : 'Locked'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {allDone ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>🎉 Table 1 mastered!</Text>
          <Text style={styles.doneSub}>Table 2 unlocks in the next build.</Text>
        </View>
      ) : (
        <Pressable style={styles.playBtn} onPress={() => next && onPlay(next)}>
          <Text style={styles.playText}>
            Play  ·  {next?.kind === 'inOrder' ? 'In Order' : 'Random'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: space(8),
    paddingHorizontal: space(3),
    paddingBottom: space(6),
    backgroundColor: colors.bg,
    minHeight: '100%',
    alignItems: 'stretch',
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
  },
  petBubble: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space(2),
  },
  petEmoji: { fontSize: 78 },
  petCaption: {
    textAlign: 'center',
    color: colors.inkSoft,
    marginTop: space(1),
    marginBottom: space(2),
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
    marginBottom: space(3),
  },
  level: { fontSize: 16, fontWeight: '800', color: colors.ink, width: 48 },
  expTrack: {
    flex: 1,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  expFill: { height: '100%', backgroundColor: colors.gold },
  exp: { fontSize: 13, fontWeight: '700', color: colors.inkSoft, width: 56, textAlign: 'right' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space(2.5),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: space(1.5) },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space(1.5),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stageName: { fontSize: 17, fontWeight: '700', color: colors.ink },
  stageGoal: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  badge: { paddingHorizontal: space(1.5), paddingVertical: space(0.75), borderRadius: radius.pill },
  badgeDone: { backgroundColor: colors.correctSoft },
  badgeNext: { backgroundColor: '#EDE9FE' },
  badgeLocked: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  playBtn: {
    marginTop: space(3),
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: space(2.25),
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  playText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  doneBox: { marginTop: space(3), alignItems: 'center' },
  doneText: { fontSize: 22, fontWeight: '800', color: colors.correct },
  doneSub: { fontSize: 14, color: colors.inkSoft, marginTop: 4 },
});
