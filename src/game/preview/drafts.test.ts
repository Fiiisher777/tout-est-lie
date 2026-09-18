import AsyncStorage from '@react-native-async-storage/async-storage';
import catalog from '../../../content/production/puzzles.json';
import released from '../../../content/production/released.json';
import { draftPuzzles, previewPuzzle, createPreviewSession, draftPreviewAvailable } from './drafts';
import { releasePuzzles } from '../content/production/release';
import { sessionAccess } from '../sessionAccess';
import { startPuzzle, selectCard, submitSelection, produceCompletionResult, applyHint } from '../engine/engine';
import { saveActiveSession, loadActiveSession } from '../../state/activeSession';
import { defaultPlayer } from '../../state/player';
const mockDisk = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: {
  getItem: jest.fn(async (key: string) => mockDisk.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockDisk.set(key, value); }),
  removeItem: jest.fn(async (key: string) => { mockDisk.delete(key); }),
} }));
beforeEach(() => { mockDisk.clear(); jest.clearAllMocks(); });
const selected = () => previewPuzzle(draftPuzzles()[0].levelId)!;
const launch = () => { const p = selected().puzzle; return { mode: 'level' as const, levelId: p.levelId, locale: p.locale, puzzleRevision: p.revision }; };
const fresh = (sessionId = 'preview') => startPuzzle(selected().puzzle, { launch: launch(), sessionId, seed: 1, clock: { monotonicMs: 0, utcMs: 0 } });
test('development preview accesses authoring drafts and prioritizes FR positions 1–10', () => {
  expect(draftPreviewAvailable()).toBe(true);
  expect(draftPuzzles().slice(0, 10).map(p => [p.locale, p.position])).toEqual(Array.from({ length: 10 }, (_, i) => ['fr', i + 1]));
  for (const p of draftPuzzles()) { expect(p.status).toBe('draft'); expect(previewPuzzle(p.levelId)?.puzzle.cards).toEqual(p.cards); }
});
test('normal release loader still excludes all authoring drafts', () => { expect(releasePuzzles(catalog, released)).toEqual([]); });
test('production rejects preview listing, direct puzzle lookup, storage, completion and GameView injection', async () => {
  const p = selected(); const session = createPreviewSession(); const state = fresh();
  const flag = jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
  try {
    expect(draftPreviewAvailable()).toBe(false); expect(draftPuzzles()).toEqual([]); expect(previewPuzzle(p.record.levelId)).toBeUndefined();
    expect(() => sessionAccess(state.launch, { puzzle: p.puzzle, position: p.record.position, storage: session.storage })).toThrow('development-only');
    await expect(session.storage.load()).rejects.toThrow('development-only'); await expect(session.storage.save(state, 100)).rejects.toThrow('development-only');
    await expect(session.complete({ ...state.launch, id: 'x', sessionId: 'x', outcome: 'won', mistakes: 0, hintsUsed: 0, elapsedMs: 0, completedAt: '2026-09-18T00:00:00.000Z' })).rejects.toThrow('development-only');
  } finally { flag.restore(); }
});
test('winning a preview never modifies normal progress, active save, or editorial records', async () => {
  const beforeCatalog = JSON.stringify(catalog);
  const player = defaultPlayer(); player.completedLevels = ['existing-win'];
  mockDisk.set('tiny-game-starter:player', JSON.stringify(player));
  await saveActiveSession(fresh('normal-sentinel'), 40);
  const beforeDisk = [...mockDisk.entries()]; jest.clearAllMocks();
  const session = createPreviewSession(); let state = fresh();
  for (const group of state.puzzle.groups) {
    for (const id of group.cardIds) state = selectCard(state, id).state;
    state = submitSelection(state, { monotonicMs: 500, utcMs: 500 }).state;
    await session.storage.save(state, 500);
  }
  const result = produceCompletionResult(state)!; await session.complete(result);
  expect(result.outcome).toBe('won'); expect(session.lastResult()).toEqual(result); expect(await session.storage.load()).toBeNull();
  expect([...mockDisk.entries()]).toEqual(beforeDisk); expect(AsyncStorage.setItem).not.toHaveBeenCalled(); expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  expect((await loadActiveSession())?.sessionId).toBe('normal-sentinel'); expect(JSON.stringify(catalog)).toBe(beforeCatalog);
});
test('isolated preview resumes selection-free with hints and time; a reload clears only preview memory', async () => {
  const session = createPreviewSession(); let state = fresh(); state = applyHint(state, state.puzzle.hints[0].id).state; state = selectCard(state, state.order[0]).state;
  await session.storage.save(state, 120);
  expect(await session.storage.load()).toMatchObject({ sessionId: 'preview', selected: [], elapsedMs: 120, usedHints: state.usedHints });
  expect(await createPreviewSession().storage.load()).toBeNull();
});
test('normal GameView continues to select the original persistent session adapter', () => {
  const puzzle = sessionAccess({ mode: 'level', levelId: 'en-easy', locale: 'en', puzzleRevision: 1 });
  expect(puzzle.puzzle.levelId).toBe('en-easy'); expect(puzzle.storage.load).toBe(loadActiveSession); expect(puzzle.storage.save).toBe(saveActiveSession);
});
