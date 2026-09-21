import { shuffle, type State } from './engine';
export { remainingTime, endTimeout, checkCountdown, continueCountdown } from './engine';
// Restart the board within the SAME attempt. No replenished time, mistakes or hints.
export function restartAttempt(s: State): State {
  if (s.status !== 'playing' || s.timedOut) return s;
  return { ...s, solved: [], selected: [], order: shuffle(s.puzzle.cards.map(c => c.id), (s.seed + s.shuffleCount + 1) >>> 0), shuffleCount: s.shuffleCount + 1 };
}
