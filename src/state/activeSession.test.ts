import AsyncStorage from '@react-native-async-storage/async-storage';
import { findPuzzle } from '../game/content';
import { applyHint, calculateRemainingMistakes, elapsedTime, selectCard, setPaused, shuffleCards, startPuzzle, submitSelection, type State } from '../game/engine/engine';
import { decodeActiveSession, loadActiveSession, matchesLaunch, saveActiveSession } from './activeSession';
const mockDisk = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: {
  getItem: jest.fn(async (key: string) => mockDisk.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockDisk.set(key, value); }),
  removeItem: jest.fn(async (key: string) => { mockDisk.delete(key); }),
} }));
const fresh = (sessionId = 'first') => startPuzzle(findPuzzle('en-easy')!, { launch: { mode: 'level', levelId: 'en-easy', locale: 'en', puzzleRevision: 1 }, sessionId, seed: 42, clock: { monotonicMs: 0, utcMs: 0 } });
function submit(s: State, ids: string[]) { for (const id of ids) s = selectCard(s, id).state; return submitSelection(s, { monotonicMs: 100, utcMs: 100 }).state; }
beforeEach(() => { mockDisk.clear(); jest.clearAllMocks(); });
test('leave and resume preserves identity and order but clears temporary selection', async () => {
  let s = shuffleCards(fresh()).state; s = selectCard(s, 'c0').state;
  await saveActiveSession(setPaused(s, 'navigation', true, 250), 900);
  const restored = (await loadActiveSession())!;
  expect(restored.sessionId).toBe('first'); expect(restored.launch).toEqual(s.launch); expect(restored.order).toEqual(s.order);
  expect(restored.seed).toBe(42); expect(restored.shuffleCount).toBe(1); expect(restored.selected).toEqual([]);
  expect(restored.activeSince).toBeNull(); expect(restored.elapsedMs).toBe(250);
});
test('process restart reloads from disk with no in-memory session or monotonic epoch', async () => {
  await saveActiveSession(submit(fresh(), ['c0', 'c1', 'c2', 'c4']), 500);
  jest.resetModules();
  const restartedStorage = jest.requireActual<typeof import('./activeSession')>('./activeSession');
  const restored = (await restartedStorage.loadActiveSession())!;
  expect(restored.mistakes).toBe(1); expect(restored.elapsedMs).toBe(500); expect(restored.activeSince).toBeNull();
  expect(elapsedTime({ ...restored, activeSince: 10 }, 110)).toBe(600);
});
test('mistakes and remaining lives survive leaving', async () => {
  let s = submit(fresh(), ['c0', 'c1', 'c2', 'c4']); s = submitSelection(s, { monotonicMs: 200, utcMs: 200 }).state;
  await saveActiveSession(s, 300); const restored = (await loadActiveSession())!;
  expect(restored.mistakes).toBe(2); expect(calculateRemainingMistakes(restored)).toBe(2);
});
test('solved groups retain solve order and remaining shuffled card order', async () => {
  let s = submit(fresh(), ['c8', 'c9', 'c10', 'c11']); s = submit(s, ['c0', 'c1', 'c2', 'c3']); s = shuffleCards(s).state;
  await saveActiveSession(s, 300); const restored = (await loadActiveSession())!;
  expect(restored.solved).toEqual(['g2', 'g0']); expect(restored.order).toEqual(s.order); expect(restored.order).toHaveLength(8);
});
test('hint usage and authored revealed information survive', async () => {
  let s = applyHint(fresh(), 'pair0').state; s = applyHint(s, 'category1').state;
  await saveActiveSession(s, 100); const restored = (await loadActiveSession())!;
  expect(restored.usedHints).toEqual(['pair0', 'category1']); expect(restored.puzzle.hints).toEqual(s.puzzle.hints); expect(applyHint(restored, 'pair0').outcome).toBe('rejected');
});
test('active elapsed time excludes ad, background, and time away', async () => {
  let s = setPaused(fresh(), 'ad', true, 200); s = setPaused(s, 'app', true, 300); s = setPaused(s, 'ad', false, 400);
  await saveActiveSession(s, 90000); const restored = (await loadActiveSession())!;
  expect(restored.elapsedMs).toBe(200); expect(elapsedTime(restored, 200000)).toBe(200);
  expect(elapsedTime({ ...restored, activeSince: 10 }, 110)).toBe(300);
});
test('restart replaces persisted state with fresh session and counters', async () => {
  await saveActiveSession(applyHint(submit(fresh(), ['c0', 'c1', 'c2', 'c4']), 'pair0').state, 200);
  await saveActiveSession(fresh('restarted'), 0); const restored = (await loadActiveSession())!;
  expect(restored.sessionId).toBe('restarted'); expect(restored.mistakes).toBe(0); expect(restored.solved).toEqual([]); expect(restored.usedHints).toEqual([]); expect(restored.elapsedMs).toBe(0);
});
test.each(['won', 'lost'] as const)('terminal %s removes persisted active state after queued saves', async outcome => {
  const playing = fresh(); let terminal = playing;
  if (outcome === 'won') for (const g of playing.puzzle.groups) terminal = submit(terminal, g.cardIds);
  else { terminal = submit(terminal, ['c0', 'c1', 'c2', 'c4']); for (let i = 0; i < 3; i++) terminal = submitSelection(terminal, { monotonicMs: 200, utcMs: 200 }).state; }
  await Promise.all([saveActiveSession(playing, 50), saveActiveSession(terminal, 200)]);
  expect(await loadActiveSession()).toBeNull(); expect(mockDisk.size).toBe(0);
});
test('legacy absence starts clean without changing player save', async () => { mockDisk.set('tiny-game-starter:player', '{"version":2}'); expect(await loadActiveSession()).toBeNull(); expect(mockDisk.size).toBe(1); });
test('future versions are preserved and block load', async () => { mockDisk.set('tiny-game-starter:active-session', '{"version":99}'); await expect(loadActiveSession()).rejects.toThrow('Unsupported'); expect(mockDisk.get('tiny-game-starter:active-session')).toBe('{"version":99}'); });
test('corrupt content cannot silently restore lives', async () => { mockDisk.set('tiny-game-starter:active-session', '{broken'); await expect(loadActiveSession()).rejects.toThrow(); });
test('invalid engine membership rejected', async () => { await saveActiveSession(fresh(), 0); const raw = JSON.parse(mockDisk.values().next().value!); raw.state.order[0] = 'unknown'; expect(decodeActiveSession(JSON.stringify(raw))).toBeNull(); });
test('read/write failures propagate and queued writes recover', async () => {
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('disk'));
  await expect(saveActiveSession(fresh(), 0)).rejects.toThrow('disk'); await saveActiveSession(fresh('retry'), 100);
  jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('read')); await expect(loadActiveSession()).rejects.toThrow('read'); expect((await loadActiveSession())?.sessionId).toBe('retry');
});
test('different puzzle, mode, revision or daily date is not the same session', () => {
  const s = fresh(); expect(matchesLaunch(s, s.launch)).toBe(true); expect(matchesLaunch(s, { ...s.launch, levelId: 'fr-easy' })).toBe(false); expect(matchesLaunch(s, { ...s.launch, puzzleRevision: 2 })).toBe(false);
  const daily = { ...s, launch: { ...s.launch, mode: 'daily' as const, date: '2026-09-17' } }; expect(matchesLaunch(s, daily.launch)).toBe(false); expect(matchesLaunch(daily, { ...daily.launch, date: '2026-09-18' })).toBe(false);
});
