import { isTester } from '../../config/environment';
import { validateProduction } from '../content/production/validate';
import { toEnginePuzzle, type ProductionPuzzle } from '../content/production/schema';
import { decodeActiveSession } from '../../state/activeSession';
import { elapsedTime } from '../engine/engine';
import type { GameResult } from '../types';
import type { SessionStorage } from '../sessionAccess';
export function draftPreviewAvailable() { return __DEV__ && !isTester; }
export function draftPuzzles(): ProductionPuzzle[] {
  if (!__DEV__ || isTester) return [];
  // This authoring lookup is reachable only in development.
  const catalog: unknown = require('../../../content/production/puzzles.json');
  if (validateProduction(catalog).length) return [];
  return (catalog as ProductionPuzzle[]).filter(p => p.status === 'draft').sort((a, b) => {
    const priority = (p: ProductionPuzzle) => p.locale === 'fr' ? (p.position <= 10 ? 0 : 1) : 2;
    return priority(a) - priority(b) || a.locale.localeCompare(b.locale) || a.position - b.position;
  });
}
export function previewPuzzle(id: string) {
  if (!__DEV__ || isTester) return undefined;
  const record = draftPuzzles().find(p => p.levelId === id);
  return record ? { record, puzzle: toEnginePuzzle(record) } : undefined;
}
// Deliberately ephemeral: no AsyncStorage, PlayerProvider update or progress reducer.
// Leaving/re-entering preview during this app run resumes it; reload clears it.
export function createPreviewSession() {
  let snapshot: string | null = null;
  let result: GameResult | null = null;
  const assertDevelopment = () => { if (!__DEV__ || isTester) throw new Error('Draft preview is development-only'); };
  const storage: SessionStorage = {
    load: async () => { assertDevelopment(); return decodeActiveSession(snapshot); },
    save: async (state, now) => {
      assertDevelopment();
      snapshot = state.status === 'playing' ? JSON.stringify({ version: 1, state: { ...state, selected: [], elapsedMs: elapsedTime(state, now), activeSince: null, pauses: [] } }) : null;
    },
  };
  return {
    storage,
    complete: async (value: GameResult) => { assertDevelopment(); result = { ...value }; },
    lastResult: () => { assertDevelopment(); return result; },
  };
}
export const previewSession = createPreviewSession();
