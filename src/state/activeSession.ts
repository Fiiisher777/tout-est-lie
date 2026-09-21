import { economyStore } from '../economy/store';
import { playtest } from '../config/playtest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameConfig } from '../config/game';
import { elapsedTime, type State } from '../game/engine/engine';
import { parsePuzzle } from '../game/content/validate';
import { isUtcDate } from '../daily/challenge';
import type { GameLaunch } from '../game/types';
const key = `${gameConfig.id}:active-session`;
let queue: Promise<void> = Promise.resolve();
export function saveActiveSession(state: State, now: number): Promise<void> {
  const snapshot = JSON.stringify({ version: 2, state: { ...state, selected: [], elapsedMs: elapsedTime(state, now), activeSince: null, pauses: [] } });
  const write = queue.catch(() => {}).then(async () => {
    // Keep a recoverable terminal snapshot until the idempotent life debit commits.
    await AsyncStorage.setItem(key, snapshot);
    if (state.status !== 'playing') {
      if (playtest.enabled && state.launch.mode === 'level' && state.status === 'lost') await economyStore.settle(state.sessionId);
      await AsyncStorage.removeItem(key);
    }
  });
  queue = write;
  return write;
}
export function decodeActiveSession(raw: string | null): State | null {
  if (!raw) return null;
  let data;
  try { data = JSON.parse(raw); } catch { return null; }
  if (!data || typeof data !== 'object') throw new Error('Invalid active session');
  if (data.version > 2) throw new Error('Unsupported active session version');
  try {
    if (![1, 2].includes(data.version)) return null;
    const s: State = data.state;
    const puzzle = parsePuzzle(s.puzzle);
    const integer = (n: number) => Number.isSafeInteger(n) && n >= 0;
    const ids = (value: readonly string[], allowed: string[]) => Array.isArray(value) && new Set(value).size === value.length && value.every(id => allowed.includes(id));
    if (!['playing', 'won', 'lost'].includes(s.status) || typeof s.sessionId !== 'string' || !s.sessionId || !integer(s.seed) || !integer(s.shuffleCount) || !integer(s.mistakes) || !Number.isFinite(s.elapsedMs) || s.elapsedMs < 0 || (s.status === 'playing' ? s.completedAt !== null : !Number.isFinite(Date.parse(s.completedAt ?? '')))) return null;
    if (s.launch.levelId !== puzzle.levelId || s.launch.locale !== puzzle.locale || s.launch.puzzleRevision !== puzzle.revision || !['level', 'daily'].includes(s.launch.mode) || (s.launch.mode === 'daily' && !isUtcDate(s.launch.date))) return null;
    if (!ids(s.solved, puzzle.groups.map(g => g.id)) || s.solved.length > 4 || (s.status === 'playing' && s.solved.length === 4) || !ids(s.usedHints, puzzle.hints.map(h => h.id))) return null;
    const remaining = puzzle.groups.filter(g => !s.solved.includes(g.id)).flatMap(g => g.cardIds);
    if (!ids(s.order, remaining) || s.order.length !== remaining.length) return null;
    if (s.status === 'won' && s.solved.length !== 4) return null;
    // Historical terminal losses remain terminal; counts never determine status.
    if (s.failureReason !== undefined && s.failureReason !== 'timeout') return null;
    if (s.penaltyMs !== undefined && (!Number.isFinite(s.penaltyMs) || s.penaltyMs < 0)) return null;
    if (s.countdownMs !== undefined && s.countdownMs !== null && (!Number.isFinite(s.countdownMs) || s.countdownMs < 0)) return null;
    if (s.continueUsed !== undefined && typeof s.continueUsed !== 'boolean') return null;
    if (s.timedOut !== undefined && typeof s.timedOut !== 'boolean') return null;
    return { ...s, penaltyMs: s.penaltyMs ?? 0, ...(!playtest.enabled ? { countdownMs: null, timedOut: false } : {}), puzzle, selected: [], activeSince: null, pauses: playtest.enabled && s.timedOut && s.status === 'playing' ? ['timeout'] : [] };
  } catch { return null; }
}
export async function loadActiveSession(): Promise<State | null> {
  await queue.catch(() => {});
  const raw = await AsyncStorage.getItem(key);
  const session = decodeActiveSession(raw);
  if (raw !== null && session === null) throw new Error('Invalid active session; refusing to silently reset progress');
  if (session?.status === 'lost' && session.launch.mode === 'level' && playtest.enabled) await economyStore.settle(session.sessionId);
  return session;
}
export function matchesLaunch(state: State, launch: GameLaunch) {
  return state.launch.levelId === launch.levelId && state.launch.mode === launch.mode && state.launch.locale === launch.locale && state.launch.puzzleRevision === launch.puzzleRevision && (launch.mode !== 'daily' || (state.launch.mode === 'daily' && state.launch.date === launch.date));
}
