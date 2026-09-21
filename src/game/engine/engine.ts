import { countdownDuration, playtest } from '../../config/playtest';
import type { Hint, Puzzle } from '../content/schema';
import { parsePuzzle } from '../content/validate';
import type { GameLaunch, GameResult } from '../types';
export type Clock = { monotonicMs: number; utcMs: number };
export type PauseReason = 'app' | 'ad' | 'navigation' | 'manual' | 'timeout';
export type State = {
  penaltyMs?: number;
  countdownMs?: number | null; continueUsed?: boolean; timedOut?: boolean; failureReason?: 'timeout';
  puzzle: Puzzle; launch: GameLaunch; sessionId: string; seed: number; shuffleCount: number;
  status: 'playing' | 'won' | 'lost'; selected: readonly string[]; order: readonly string[];
  solved: readonly string[]; mistakes: number; usedHints: readonly string[];
  elapsedMs: number; activeSince: number | null; pauses: readonly PauseReason[]; completedAt: string | null;
};
export type Outcome = 'selected' | 'deselected' | 'cleared' | 'shuffled' | 'solved' | 'mistake' | 'hint' | 'rejected';
export type Transition = { state: State; outcome: Outcome; groupId?: string; hint?: Hint };
export function shuffle<T>(values: readonly T[], seed: number): T[] {
  const result = [...values]; let x = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    x = (x + 0x6d2b79f5) >>> 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    const j = Math.floor(((t ^ (t >>> 14)) >>> 0) / 4294967296 * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function startPuzzle(input: Puzzle, options: { launch: GameLaunch; sessionId: string; seed: number; clock: Clock; position?: number }): State {
  const puzzle = JSON.parse(JSON.stringify(parsePuzzle(input))) as Puzzle;
  const { launch, sessionId, seed, clock } = options;
  if (launch.levelId !== puzzle.levelId || launch.locale !== puzzle.locale || launch.puzzleRevision !== puzzle.revision) throw new Error('Launch does not match puzzle');
  return { penaltyMs: 0, countdownMs: countdownDuration(puzzle.difficulty, options.position), continueUsed: false, timedOut: false, puzzle, launch: { ...launch }, sessionId, seed, shuffleCount: 0, status: 'playing', selected: [], order: shuffle(puzzle.cards.map(c => c.id), seed), solved: [], mistakes: 0, usedHints: [], elapsedMs: 0, activeSince: clock.monotonicMs, pauses: [], completedAt: null };
}
export function elapsedTime(s: State, now: number): number { return s.elapsedMs + (s.activeSince === null ? 0 : Math.max(0, now - s.activeSince)); }
export function setPaused(s: State, reason: PauseReason, paused: boolean, now: number): State {
  if (s.status !== 'playing' || s.pauses.includes(reason) === paused) return s;
  const pauses = paused ? [...s.pauses, reason] : s.pauses.filter(p => p !== reason);
  return { ...s, elapsedMs: elapsedTime(s, now), activeSince: pauses.length ? null : now, pauses };
}
const playable = (s: State) => s.status === 'playing' && s.pauses.length === 0;
const reject = (state: State): Transition => ({ state, outcome: 'rejected' });
export function selectCard(s: State, id: string): Transition {
  if (!playable(s) || s.selected.length === 4 || s.selected.includes(id) || !s.order.includes(id)) return reject(s);
  return { state: { ...s, selected: [...s.selected, id] }, outcome: 'selected' };
}
export function deselectCard(s: State, id: string): Transition {
  return !playable(s) || !s.selected.includes(id) ? reject(s) : { state: { ...s, selected: s.selected.filter(c => c !== id) }, outcome: 'deselected' };
}
export function clearSelection(s: State): Transition { return !playable(s) ? reject(s) : { state: { ...s, selected: [] }, outcome: 'cleared' }; }
export function shuffleCards(s: State): Transition {
  if (!playable(s)) return reject(s);
  const shuffleCount = s.shuffleCount + 1;
  return { state: { ...s, shuffleCount, order: shuffle(s.order, (s.seed + shuffleCount) >>> 0) }, outcome: 'shuffled' };
}
export function determineOutcome(s: State): State['status'] { return s.status === 'lost' ? 'lost' : s.solved.length === 4 ? 'won' : 'playing'; }
export function submitSelection(s: State, clock: Clock): Transition {
  if (!playable(s) || s.selected.length !== 4) return reject(s);
  const timed = checkCountdown(s, clock);
  if (timed.timedOut || timed.status !== 'playing') return reject(timed);
  const group = s.puzzle.groups.find(g => g.cardIds.every(id => s.selected.includes(id)));
  let next: State = group ? { ...s, selected: [], solved: [...s.solved, group.id], order: s.order.filter(id => !group.cardIds.includes(id)) } : { ...s, selected: [], mistakes: s.mistakes + 1, penaltyMs: (s.penaltyMs ?? 0) + Math.min(remainingTime(s, clock.monotonicMs) ?? 0, playtest.wrongAnswerPenaltySeconds * 1000) };
  if (!group) next = checkCountdown(next, clock);
  const status = determineOutcome(next);
  if (status !== 'playing') next = { ...next, status, elapsedMs: elapsedTime(s, clock.monotonicMs), activeSince: null, completedAt: new Date(clock.utcMs).toISOString() };
  return { state: next, outcome: group ? 'solved' : 'mistake', groupId: group?.id };
}
export function getAvailableHints(s: State): Hint[] { return s.status !== 'playing' ? [] : s.puzzle.hints.filter(h => !s.usedHints.includes(h.id) && !s.solved.includes(h.groupId)); }
export function applyHint(s: State, hintId: string): Transition {
  const hint = getAvailableHints(s).find(h => h.id === hintId);
  return !hint ? reject(s) : { state: { ...s, usedHints: [...s.usedHints, hintId] }, outcome: 'hint', hint };
}
export function produceCompletionResult(s: State): GameResult | null {
  if (s.status === 'playing' || !s.completedAt) return null;
  return { ...(s.failureReason ? { failureReason: s.failureReason } : {}), penaltySeconds: (s.penaltyMs ?? 0) / 1000, rewardedContinueUsed: s.continueUsed ?? false, ...s.launch, id: `result-${s.sessionId}`, sessionId: s.sessionId, outcome: s.status, mistakes: s.mistakes, hintsUsed: s.usedHints.length, elapsedMs: Math.round(s.elapsedMs), completedAt: s.completedAt };
}

export function remainingTime(s: State, now: number): number | null {
  return !playtest.enabled || s.countdownMs == null ? null : Math.max(0, s.countdownMs - elapsedTime(s, now) - (s.penaltyMs ?? 0));
}
export function endTimeout(s: State, clock: Clock): State {
  if (s.status !== 'playing' || !s.timedOut) return s;
  return { ...s, status: 'lost', failureReason: 'timeout', activeSince: null, completedAt: new Date(clock.utcMs).toISOString() };
}
export function checkCountdown(s: State, clock: Clock): State {
  if (s.status !== 'playing' || s.timedOut || remainingTime(s, clock.monotonicMs) !== 0) return s;
  const paused = setPaused(s, 'timeout', true, clock.monotonicMs);
  const next = { ...paused, elapsedMs: Math.max(0, s.countdownMs! - (s.penaltyMs ?? 0)), timedOut: true };
  return s.continueUsed ? endTimeout(next, clock) : next;
}
export function continueCountdown(s: State, clock: Clock): State {
  if (s.status !== 'playing' || !s.timedOut || s.continueUsed || s.countdownMs == null) return s;
  return setPaused({ ...s, timedOut: false, continueUsed: true, countdownMs: s.countdownMs + playtest.extensionSeconds * 1000 }, 'timeout', false, clock.monotonicMs);
}
