import { RoundResult, StageConfig } from './types';

export const EXP_PER_CORRECT = 1;
export const MASTERY_BONUS_FIRST = 50;
export const MASTERY_BONUS_REPLAY = 10;
export const MAX_SPEED_BONUS = 15;

/**
 * Evaluate a finished round against the stage's pass conditions and compute EXP.
 *
 * EXP comes from two sources, as designed:
 *   1. Per correct answer (every question is eventually answered correctly).
 *   2. Completing/mastering the stage (a one-time bonus, smaller on replay),
 *      plus a speed bonus scaled by how far under the time goal you finished.
 */
export function evaluateRound(
  stage: StageConfig,
  questionsCount: number,
  mistakes: number,
  elapsedMs: number,
  isFirstMastery: boolean,
): RoundResult {
  const passedTime = elapsedMs <= stage.timeGoalMs;
  const passedAccuracy = !stage.requireNoMistakes || mistakes === 0;
  const mastered = passedTime && passedAccuracy;

  let exp = questionsCount * EXP_PER_CORRECT;

  if (mastered) {
    exp += isFirstMastery ? MASTERY_BONUS_FIRST : MASTERY_BONUS_REPLAY;
  }

  // Speed bonus: full bonus at instant completion, 0 at the time limit.
  if (passedTime) {
    const fractionUsed = elapsedMs / stage.timeGoalMs; // 0..1
    exp += Math.round(MAX_SPEED_BONUS * (1 - fractionUsed));
  }

  return {
    questionsCount,
    mistakes,
    elapsedMs,
    passedTime,
    passedAccuracy,
    mastered,
    expEarned: exp,
  };
}

/** Levelling curve: total EXP needed to *reach* a given level. */
export function expForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level - 1, 1.5));
}

/** Derive level + progress within the level from a running EXP total. */
export function levelFromExp(totalExp: number): {
  level: number;
  intoLevel: number;
  forNextLevel: number;
} {
  let level = 1;
  while (totalExp >= expForLevel(level + 1)) {
    level++;
  }
  const base = expForLevel(level);
  const next = expForLevel(level + 1);
  return {
    level,
    intoLevel: totalExp - base,
    forNextLevel: next - base,
  };
}
