import { makeStage } from '../game/questions';
import { stageKey } from '../game/stages';
import { RoundResult, StageConfig, StageKind } from '../game/types';

// In-memory progress for Milestone 1 (persistence comes in a later milestone).
// Tracks EXP, which stages are mastered, and best times per stage.

export interface Progress {
  totalExp: number;
  mastered: Record<string, boolean>; // stageKey -> mastered
  bestTimeMs: Record<string, number>; // stageKey -> best elapsed
}

export function initialProgress(): Progress {
  return { totalExp: 0, mastered: {}, bestTimeMs: {} };
}

export function isMastered(p: Progress, table: number, kind: StageKind): boolean {
  return !!p.mastered[stageKey({ table, kind })];
}

export function bestTime(p: Progress, stage: StageConfig): number | undefined {
  return p.bestTimeMs[stageKey(stage)];
}

/** Apply a finished round to progress, returning a new Progress object. */
export function applyResult(p: Progress, stage: StageConfig, result: RoundResult): Progress {
  const key = stageKey(stage);
  const next: Progress = {
    totalExp: p.totalExp + result.expEarned,
    mastered: { ...p.mastered },
    bestTimeMs: { ...p.bestTimeMs },
  };
  if (result.mastered) {
    next.mastered[key] = true;
    const prevBest = p.bestTimeMs[key];
    if (prevBest === undefined || result.elapsedMs < prevBest) {
      next.bestTimeMs[key] = result.elapsedMs;
    }
  }
  return next;
}

/**
 * The Milestone-1 ladder: Table 1, In Order then Random.
 * Returns the next stage the player should attempt, or null if all are mastered.
 */
export function nextStage(p: Progress): StageConfig | null {
  const ladder: StageConfig[] = [makeStage(1, 'inOrder'), makeStage(1, 'random')];
  for (const stage of ladder) {
    if (!isMastered(p, stage.table, stage.kind)) return stage;
  }
  return null;
}
