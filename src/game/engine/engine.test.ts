import { findPuzzle } from '../content';
import { applyHint, clearSelection, deselectCard, elapsedTime, getAvailableHints, produceCompletionResult, selectCard, setPaused, shuffle, shuffleCards, startPuzzle, submitSelection, type State } from './engine';
const puzzle = findPuzzle('en-easy')!;
export const fresh = () => startPuzzle(puzzle, { launch: { mode: 'level', levelId: puzzle.levelId, locale: 'en', puzzleRevision: 1 }, sessionId: 'test', seed: 42, clock: { monotonicMs: 0, utcMs: 0 } });
const select = (s: State, ids: readonly string[]) => ids.reduce((next, id) => selectCard(next, id).state, s);
const submit = (s: State) => submitSelection(s, { monotonicMs: 1000, utcMs: 100000 });
export function win(s = fresh()) { for (const g of puzzle.groups) s = submit(select(s, g.cardIds)).state; return s; }
test('selection caps at four and rejects unknown/duplicate cards', () => {
  const s = select(fresh(), ['c0', 'c1', 'c2', 'c3', 'c4', 'c0', 'missing']); expect(s.selected).toEqual(['c0', 'c1', 'c2', 'c3']);
  expect(deselectCard(s, 'c0').state.selected).toEqual(['c1', 'c2', 'c3']); expect(clearSelection(s).state.selected).toEqual([]);
});
test('incomplete selection is rejected without penalty', () => { const s = select(fresh(), ['c0']); expect(submit(s).state).toBe(s); });
test('correct group matches regardless of selection order and locks cards', () => {
  const s = submit(select(fresh(), ['c3', 'c1', 'c0', 'c2'])).state;
  expect(s.solved).toEqual(['g0']); expect(s.order).toHaveLength(12); expect(s.selected).toEqual([]); expect(selectCard(s, 'c0').state).toBe(s);
});
test('incorrect submission clears selection and records a wrong answer', () => {
  const s = select(fresh(), ['c0', 'c1', 'c2', 'c4']); const next = submit(s).state;
  expect(next.mistakes).toBe(1); expect(next.selected).toEqual([]); expect(next.penaltyMs).toBe(5000);
});
test('wrong submissions never fail by count', () => {
  let s: State = { ...fresh(), countdownMs: null }; for (let i = 0; i < 10; i++) s = submit(select(s, ['c0','c1','c2','c4'])).state;
  expect(s.status).toBe('playing'); expect(s.mistakes).toBe(10); expect(s.penaltyMs).toBe(0);
});
test('four solved groups win and completion result is frozen', () => {
  const s = win(); expect(s.status).toBe('won'); expect(s.order).toEqual([]);
  expect(produceCompletionResult(s)).toMatchObject({ levelId: 'en-easy', outcome: 'won', mistakes: 0, hintsUsed: 0, elapsedMs: 1000, completedAt: '1970-01-01T00:01:40.000Z' });
  expect(produceCompletionResult(s)).toEqual(produceCompletionResult(s)); expect(produceCompletionResult(fresh())).toBeNull();
});
test('pair/category hints are once per session and never solve or select', () => {
  let s = applyHint(fresh(), 'pair0').state; s = applyHint(s, 'category0').state;
  expect(s.usedHints).toEqual(['pair0', 'category0']); expect(s.solved).toEqual([]); expect(s.selected).toEqual([]);
  expect(applyHint(s, 'pair0').state).toBe(s); expect(applyHint(s, 'eliminate').state).toBe(s);
  s = submit(select(s, puzzle.groups[0].cardIds)).state; expect(getAvailableHints(s).some(h => h.groupId === 'g0')).toBe(false);
});
test('seeded shuffle is deterministic and preserves solved order and selection', () => {
  expect(shuffle(puzzle.cards, 42)).toEqual(shuffle(puzzle.cards, 42)); expect(shuffle(puzzle.cards, 42)).not.toEqual(shuffle(puzzle.cards, 43));
  let s = submit(select(fresh(), puzzle.groups[2].cardIds)).state; s = select(s, ['c0']); const next = shuffleCards(s).state;
  expect(next.solved).toEqual(['g2']); expect(next.selected).toEqual(['c0']); expect([...next.order].sort()).toEqual([...s.order].sort());
});
test('overlapping app/ad/manual pauses exclude all suspended time', () => {
  let s = setPaused(fresh(), 'ad', true, 100); s = setPaused(s, 'app', true, 120); s = setPaused(s, 'ad', false, 200);
  expect(elapsedTime(s, 900)).toBe(100); s = setPaused(s, 'app', false, 1000); expect(elapsedTime(s, 1200)).toBe(300);
  s = setPaused(s, 'manual', true, 1200); expect(selectCard(s, 'c0').state).toBe(s); expect(elapsedTime(s, 9999)).toBe(300);
});
test('terminal result captures active time and hints, not UTC duration', () => {
  let s = applyHint(fresh(), 'pair0').state; s = setPaused(s, 'ad', true, 100); s = setPaused(s, 'ad', false, 900);
  expect(produceCompletionResult(win(s))).toMatchObject({ elapsedMs: 200, hintsUsed: 1 });
});
test('transitions do not mutate state or fixture', () => {
  const s = fresh(); const before = JSON.stringify(s); Object.freeze(s); Object.freeze(s.selected); Object.freeze(s.order);
  selectCard(s, 'c0'); shuffleCards(s); applyHint(s, 'pair0'); expect(JSON.stringify(s)).toBe(before);
});
test('start rejects malformed content and mismatched launch', () => {
  expect(() => startPuzzle({ ...puzzle, cards: [] }, { launch: fresh().launch, sessionId: 'x', seed: 0, clock: { monotonicMs: 0, utcMs: 0 } })).toThrow();
  expect(() => startPuzzle(puzzle, { launch: { ...fresh().launch, locale: 'fr' }, sessionId: 'x', seed: 0, clock: { monotonicMs: 0, utcMs: 0 } })).toThrow();
});
test('restart creates a clean independent session', () => { const old = win(); const next = fresh(); expect(next.status).toBe('playing'); expect(next.mistakes).toBe(0); expect(next.usedHints).toEqual([]); expect(old.status).toBe('won'); });
