// Core game types for LuluMath. These are pure data — no React, no Expo —
// so the game rules can be reasoned about (and later unit-tested) on their own.

export type StageKind = 'inOrder' | 'random' | 'mixedReview';

export interface Question {
  /** The table being practised, e.g. 1 in "1 × 7". */
  table: number;
  /** The multiplier, e.g. 7 in "1 × 7". */
  multiplier: number;
  /** The correct product. */
  answer: number;
}

export interface StageConfig {
  /** Table this stage belongs to (1–12). */
  table: number;
  kind: StageKind;
  /** Smallest multiplier asked (default 1; set 0 to include ×0). */
  minMultiplier: number;
  /** Largest multiplier asked (default 12). */
  maxMultiplier: number;
  /** Time goal in milliseconds (default 15000 = 15s). */
  timeGoalMs: number;
  /** If true, a single mistake prevents "mastered" (Random / Mixed). */
  requireNoMistakes: boolean;
}

export interface RoundResult {
  questionsCount: number;
  mistakes: number;
  elapsedMs: number;
  passedTime: boolean;
  passedAccuracy: boolean;
  mastered: boolean;
  expEarned: number;
}
