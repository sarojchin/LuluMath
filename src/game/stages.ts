import { StageConfig, StageKind } from './types';

export const KIND_LABEL: Record<StageKind, string> = {
  inOrder: 'In Order',
  random: 'Random',
  mixedReview: 'Mixed Review',
};

/** Human title for the top of the challenge screen, e.g. "1× Table · In Order". */
export function stageTitle(stage: StageConfig): string {
  return `${stage.table}× Table · ${KIND_LABEL[stage.kind]}`;
}

/** Stable key for storing best times / mastery, e.g. "T1_RANDOM". */
export function stageKey(stage: { table: number; kind: StageKind }): string {
  return `T${stage.table}_${stage.kind.toUpperCase()}`;
}

/** Short description of the pass condition, shown to the player. */
export function stageGoal(stage: StageConfig): string {
  const secs = Math.round(stage.timeGoalMs / 1000);
  return stage.requireNoMistakes
    ? `Finish in ${secs}s with no mistakes`
    : `Finish in ${secs}s`;
}
