import { Question, StageConfig, StageKind } from './types';

export const TIME_GOAL_MS = 15_000;

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function tableQuestions(table: number, minMul: number, maxMul: number): Question[] {
  const out: Question[] = [];
  for (let m = minMul; m <= maxMul; m++) {
    out.push({ table, multiplier: m, answer: table * m });
  }
  return out;
}

/**
 * Build the ordered list of questions for a stage.
 *  - inOrder:      table × min..max, sequenced.
 *  - random:       same set, shuffled.
 *  - mixedReview:  a shuffled sample drawn from every table 1..N so the round
 *                  stays roughly one screen of questions instead of N×13.
 */
export function generateQuestions(stage: StageConfig): Question[] {
  const { table, kind, minMultiplier: min, maxMultiplier: max } = stage;

  if (kind === 'inOrder') {
    return tableQuestions(table, min, max);
  }

  if (kind === 'random') {
    return shuffle(tableQuestions(table, min, max));
  }

  // mixedReview: pool every table from 1..N, then sample `roundLength`.
  const pool: Question[] = [];
  for (let t = 1; t <= table; t++) {
    pool.push(...tableQuestions(t, min, max));
  }
  const roundLength = max - min + 1;
  return shuffle(pool).slice(0, Math.min(roundLength, pool.length));
}

/** Convenience: a default stage config for a given table + kind. */
export function makeStage(
  table: number,
  kind: StageKind,
  overrides: Partial<StageConfig> = {},
): StageConfig {
  return {
    table,
    kind,
    minMultiplier: 1,
    maxMultiplier: 12,
    timeGoalMs: TIME_GOAL_MS,
    requireNoMistakes: kind !== 'inOrder',
    ...overrides,
  };
}
