import { playtest } from '../../config/playtest';
import { elapsedTime, setPaused, shuffle, type State, type Clock } from './engine';
export function remainingTime(s: State, now: number): number | null {
  return !playtest.enabled || s.countdownMs == null ? null : Math.max(0, s.countdownMs - elapsedTime(s, now));
}
export function endTimeout(s: State, clock: Clock): State {
  if (s.status !== 'playing' || !s.timedOut) return s;
  return { ...s, status: 'lost', failureReason: 'timeout', activeSince: null, completedAt: new Date(clock.utcMs).toISOString() };
}
export function checkCountdown(s: State, clock: Clock): State {
  if (s.status !== 'playing' || s.timedOut || remainingTime(s, clock.monotonicMs) !== 0) return s;
  const paused = setPaused(s, 'timeout', true, clock.monotonicMs);
  const next = { ...paused, elapsedMs: s.countdownMs!, timedOut: true };
  return s.continueUsed ? endTimeout(next, clock) : next;
}
export function continueCountdown(s: State, clock: Clock): State {
  if (s.status !== 'playing' || !s.timedOut || s.continueUsed || s.countdownMs == null) return s;
  return setPaused({ ...s, timedOut: false, continueUsed: true, countdownMs: s.countdownMs + playtest.extensionSeconds * 1000 }, 'timeout', false, clock.monotonicMs);
}
// Restart the board within the SAME attempt. No replenished time, mistakes or hints.
export function restartAttempt(s: State): State {
  if (s.status !== 'playing' || s.timedOut) return s;
  return { ...s, solved: [], selected: [], order: shuffle(s.puzzle.cards.map(c => c.id), (s.seed + s.shuffleCount + 1) >>> 0), shuffleCount: s.shuffleCount + 1 };
}
