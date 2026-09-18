import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameConfig } from '../config/game';
import { elapsedTime, type State } from '../game/engine/engine';
import { parsePuzzle } from '../game/content/validate';
import { isUtcDate } from '../daily/challenge';
import type { GameLaunch } from '../game/types';
const key = `${gameConfig.id}:active-session`;
let queue: Promise<void> = Promise.resolve();
export function saveActiveSession(state: State, now: number): Promise<void> {
  const snapshot = JSON.stringify({ version: 1, state: { ...state, selected: [], elapsedMs: elapsedTime(state, now), activeSince: null, pauses: [] } });
  const write = queue.catch(() => {}).then(() => state.status === 'playing' ? AsyncStorage.setItem(key, snapshot) : AsyncStorage.removeItem(key));
  queue = write;
  return write;
}
export function decodeActiveSession(raw: string | null): State | null {
  if (!raw) return null;
  let data;
  try { data = JSON.parse(raw); } catch { return null; }
  if (!data || typeof data !== 'object') throw new Error('Invalid active session');
  if (data.version > 1) throw new Error('Unsupported active session version');
  try {
    if (data.version !== 1) return null;
    const s: State = data.state;
    const puzzle = parsePuzzle(s.puzzle);
    const integer = (n: number) => Number.isSafeInteger(n) && n >= 0;
    const ids = (value: readonly string[], allowed: string[]) => Array.isArray(value) && new Set(value).size === value.length && value.every(id => allowed.includes(id));
    if (s.status !== 'playing' || typeof s.sessionId !== 'string' || !s.sessionId || !integer(s.seed) || !integer(s.shuffleCount) || !integer(s.mistakes) || s.mistakes >= 4 || !Number.isFinite(s.elapsedMs) || s.elapsedMs < 0 || s.completedAt !== null) return null;
    if (s.launch.levelId !== puzzle.levelId || s.launch.locale !== puzzle.locale || s.launch.puzzleRevision !== puzzle.revision || !['level', 'daily'].includes(s.launch.mode) || (s.launch.mode === 'daily' && !isUtcDate(s.launch.date))) return null;
    if (!ids(s.solved, puzzle.groups.map(g => g.id)) || s.solved.length >= 4 || !ids(s.usedHints, puzzle.hints.map(h => h.id))) return null;
    const remaining = puzzle.groups.filter(g => !s.solved.includes(g.id)).flatMap(g => g.cardIds);
    if (!ids(s.order, remaining) || s.order.length !== remaining.length) return null;
    return { ...s, puzzle, selected: [], activeSince: null, pauses: [] };
  } catch { return null; }
}
export async function loadActiveSession(): Promise<State | null> {
  await queue.catch(() => {});
  const raw = await AsyncStorage.getItem(key);
  const session = decodeActiveSession(raw);
  if (raw !== null && session === null) throw new Error('Invalid active session; refusing to silently reset progress');
  return session;
}
export function matchesLaunch(state: State, launch: GameLaunch) {
  return state.launch.levelId === launch.levelId && state.launch.mode === launch.mode && state.launch.locale === launch.locale && state.launch.puzzleRevision === launch.puzzleRevision && (launch.mode !== 'daily' || (state.launch.mode === 'daily' && state.launch.date === launch.date));
}
