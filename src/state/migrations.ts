import { deriveProgression, type Progression } from './progression';
import { isUtcDate } from '../daily/challenge';
import type { GameResult } from '../game/types';
import { defaultPlayer, type Language, type PlayerState } from './player';
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const safeId = (v: unknown): v is string => typeof v === 'string' && /^[a-zA-Z0-9_-]{1,150}$/.test(v) && !['__proto__', 'constructor', 'prototype'].includes(v);
export function validResult(v: unknown): v is GameResult {
  return object(v) && safeId(v.id) && safeId(v.sessionId) && safeId(v.levelId) && ['fr', 'en', 'es'].includes(String(v.locale)) && Number.isInteger(v.puzzleRevision) && Number(v.puzzleRevision) > 0
    && ['won', 'lost'].includes(String(v.outcome)) && Number.isInteger(v.mistakes) && Number(v.mistakes) >= 0
    && (v.penaltySeconds === undefined || (typeof v.penaltySeconds === 'number' && Number.isFinite(v.penaltySeconds) && v.penaltySeconds >= 0))
    && (v.rewardedContinueUsed === undefined || typeof v.rewardedContinueUsed === 'boolean')
    && Number.isInteger(v.hintsUsed) && Number(v.hintsUsed) >= 0 && typeof v.elapsedMs === 'number' && Number.isFinite(v.elapsedMs) && v.elapsedMs >= 0
    && typeof v.completedAt === 'string' && Number.isFinite(Date.parse(v.completedAt)) && (v.mode === 'level' || (v.mode === 'daily' && isUtcDate(v.date)));
}
export type Migration = { state: PlayerState; warning: 'recovered' | 'futureVersion' | null; writable: boolean };
export function migratePlayer(raw: string | null): Migration {
  const state = defaultPlayer();
  if (raw === null) return { state, warning: null, writable: true };
  try {
    const data: unknown = JSON.parse(raw);
    if (!object(data)) throw new Error('Invalid save');
    if (typeof data.version === 'number' && data.version > 3) return { state, warning: 'futureVersion', writable: false };
    if (![0, 1, 2, 3].includes(Number(data.version)) || typeof data.version !== 'number') throw new Error('Invalid version');
    if (object(data.preferences)) {
      const p = data.preferences;
      if (typeof p.sound === 'boolean') state.preferences.sound = p.sound;
      if (typeof p.haptics === 'boolean') state.preferences.haptics = p.haptics;
      if (['system', 'en', 'fr', 'es'].includes(String(p.language))) state.preferences.language = p.language as Language;
    }
    // Starter scores cannot be interpreted as real puzzle wins. Preserve preferences only.
    if (data.version >= 2) {
      if (Array.isArray(data.completedLevels)) state.completedLevels = [...new Set(data.completedLevels.filter(safeId))];
      if (validResult(data.lastResult)) state.lastResult = data.lastResult;
      if (object(data.dailyCompletions)) state.dailyCompletions = Object.fromEntries(Object.entries(data.dailyCompletions).filter(([k, v]) => validResult(v) && v.mode === 'daily' && v.outcome === 'won' && k === `${v.locale}:${v.date}`)) as Record<string, GameResult>;
    }
    state.highestUnlockedLevel = deriveProgression(state.completedLevels, object(data.highestUnlockedLevel) ? data.highestUnlockedLevel as Partial<Progression> : undefined);
    return { state, warning: null, writable: true };
  } catch { return { state, warning: 'recovered', writable: true }; }
}
