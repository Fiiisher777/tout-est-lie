import { isTester } from '../config/environment';
import { findPuzzle } from './content';
import { loadActiveSession, saveActiveSession } from '../state/activeSession';
import type { Puzzle } from './content/schema';
import type { State } from './engine/engine';
import type { GameLaunch } from './types';
export type SessionStorage = {
  load: () => Promise<State | null>;
  save: (state: State, now: number) => Promise<void>;
};
export type DevelopmentPreview = { puzzle: Puzzle; position: number; storage: SessionStorage };
const normalStorage: SessionStorage = { load: loadActiveSession, save: saveActiveSession };
// Only the data source and storage destination vary; all session rules stay shared.
export function sessionAccess(launch: GameLaunch, preview?: DevelopmentPreview) {
  if (preview && (!__DEV__ || isTester)) throw new Error('Draft preview is development-only');
  const puzzle = preview?.puzzle ?? findPuzzle(launch.levelId);
  if (!puzzle || puzzle.levelId !== launch.levelId || puzzle.locale !== launch.locale || puzzle.revision !== launch.puzzleRevision) throw new Error('Puzzle unavailable');
  return { puzzle, storage: preview?.storage ?? normalStorage };
}
