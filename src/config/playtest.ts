import { playtestEnabled } from './environment';
// Tunable playtest decisions, not permanent product economics.
export const playtest = {
  enabled: playtestEnabled, maxLives: 5, lifeRegenMinutes: 30,
  extensionSeconds: 30, wrongAnswerPenaltySeconds: 5, urgencySeconds: 20, tickMs: 250, checkpointMs: 1000,
  relaxedPositions: 3,
  countdownSeconds: { 1: 60, 2: 75, 3: 90, 4: 105, 5: 120 },
} as const;
export function countdownDuration(difficulty: 1 | 2 | 3 | 4 | 5, position?: number): number | null {
  if (!playtest.enabled || (position !== undefined && position >= 1 && position <= playtest.relaxedPositions)) return null;
  return playtest.countdownSeconds[difficulty] * 1000;
}
export function formatTime(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
