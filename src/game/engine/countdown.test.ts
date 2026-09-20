import { countdownDuration, playtest } from '../../config/playtest';
import { startPuzzle, selectCard, submitSelection, setPaused, applyHint, produceCompletionResult } from './engine';
import { checkCountdown, remainingTime, continueCountdown, endTimeout, restartAttempt } from './countdown';
import { findPuzzle } from '../content';
const fresh = (position = 4) => startPuzzle(findPuzzle('en-easy')!, { launch: { mode: 'level', levelId: 'en-easy', locale: 'en', puzzleRevision: 1 }, sessionId: 'attempt', seed: 3, clock: { monotonicMs: 0, utcMs: 0 }, position });
const clock = (monotonicMs: number) => ({ monotonicMs, utcMs: monotonicMs });
test.each([1, 2, 3])('position %i has no countdown', position => { const s = fresh(position); expect(remainingTime(s, 999999)).toBeNull(); expect(checkCountdown(s, clock(999999))).toBe(s); });
test.each([[1, 60], [2, 75], [3, 90], [4, 105], [5, 120]] as const)('difficulty %i uses configured %i seconds', (difficulty, seconds) => { expect(countdownDuration(difficulty, 4)).toBe(seconds * 1000); });
test('background and ad pauses overlap without counting suspended time', () => {
  let s = setPaused(fresh(), 'app', true, 10000); s = setPaused(s, 'ad', true, 11000); s = setPaused(s, 'app', false, 90000);
  expect(remainingTime(s, 100000)).toBe(50000); s = setPaused(s, 'ad', false, 100000); expect(remainingTime(s, 101000)).toBe(49000);
});
test('timeout freezes and is not yet a terminal failure', () => {
  expect(checkCountdown(fresh(), clock(59999)).timedOut).toBe(false);
  const s = checkCountdown(fresh(), clock(60000)); expect(s.timedOut).toBe(true); expect(s.status).toBe('playing'); expect(s.activeSince).toBeNull();
  expect(selectCard(s, 'c0').state).toBe(s); expect(produceCompletionResult(s)).toBeNull(); expect(remainingTime(s, 999999)).toBe(0);
});
test('one extension preserves layout, mistakes, solved groups and session', () => {
  expect(playtest.extensionSeconds).toBe(30);
  let s = fresh(); for (const id of ['c0','c1','c2','c3']) s = selectCard(s,id).state;
  s = submitSelection(s, clock(100)).state; s = { ...s, mistakes: 2 };
  const timed = checkCountdown(s, clock(60000)); const continued = continueCountdown(timed, clock(999999));
  expect(remainingTime(continued, 999999)).toBe(playtest.extensionSeconds * 1000); expect(continued.solved).toEqual(s.solved); expect(continued.order).toEqual(s.order); expect(continued.mistakes).toBe(2); expect(continued.sessionId).toBe(s.sessionId);
  expect(continueCountdown(continued, clock(999999))).toBe(continued);
});
test('second timeout fails with unchanged mistakes and frozen active time', () => {
  const s = continueCountdown(checkCountdown(fresh(), clock(60000)), clock(200000));
  const failed = checkCountdown(s, clock(230000)); expect(failed.status).toBe('lost'); expect(failed.mistakes).toBe(0);
  expect(produceCompletionResult(failed)).toMatchObject({ outcome: 'lost', failureReason: 'timeout', elapsedMs: 90000 });
  expect(continueCountdown(failed, clock(300000))).toBe(failed);
});
test('declining timeout ends the attempt exactly once', () => { const failed = endTimeout(checkCountdown(fresh(), clock(60000)), clock(130000)); expect(failed.status).toBe('lost'); expect(endTimeout(failed, clock(200000))).toBe(failed); });
test('restart cannot restore mistakes, time, hints, or rewarded eligibility', () => {
  let s = applyHint(fresh(), 'pair0').state; s = { ...s, mistakes: 3, solved: ['g0'], order: s.order.filter(id => !['c0','c1','c2','c3'].includes(id)) };
  s = continueCountdown(checkCountdown(s, clock(60000)), clock(200000)); const restarted = restartAttempt(s);
  expect(restarted.sessionId).toBe(s.sessionId); expect(restarted.mistakes).toBe(3); expect(restarted.usedHints).toEqual(['pair0']); expect(restarted.continueUsed).toBe(true);
  expect(remainingTime(restarted, 205000)).toBe(25000); expect(restarted.solved).toEqual([]); expect(restarted.order).toHaveLength(16);
});
test('restart cannot dismiss timeout or final failure', () => { const s = checkCountdown(fresh(), clock(60000)); expect(restartAttempt(s)).toBe(s); });
