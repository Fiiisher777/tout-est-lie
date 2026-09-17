import { isUtcDate } from '../daily/challenge';
import type { GameResult } from '../game/types';
import { defaultPlayer, type Language, type PlayerState } from './player';
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const safeId = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
const score = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
function result(value: unknown): value is GameResult {
    return object(value) && safeId(value.id) && safeId(value.levelId) && score(value.score)
        && typeof value.completedAt === 'string' && Number.isFinite(Date.parse(value.completedAt))
        && (value.mode === 'level' || (value.mode === 'daily' && isUtcDate(value.date)));
}
export type Migration = {
    state: PlayerState;
    warning: 'recovered' | 'futureVersion' | null;
    writable: boolean;
};
export function migratePlayer(raw: string | null): Migration {
    const state = defaultPlayer();
    if (raw === null)
        return { state, warning: null, writable: true };
    try {
        let data: unknown = JSON.parse(raw);
        if (!object(data))
            throw new Error('Invalid save');
        if (typeof data.version === 'number' && data.version > 1)
            return { state, warning: 'futureVersion', writable: false };
        // v0 is the same document before lastResult was introduced.
        if (data.version === 0)
            data = { ...data, version: 1, lastResult: null };
        if (!object(data) || data.version !== 1)
            throw new Error('Unknown save version');
        if (Array.isArray(data.completedLevels))
            state.completedLevels = [...new Set(data.completedLevels.filter(safeId))];
        if (object(data.bestResults))
            state.bestResults = Object.fromEntries(Object.entries(data.bestResults).filter(([key, value]) => safeId(key) && score(value))) as Record<string, number>;
        if (object(data.preferences)) {
            const p = data.preferences;
            if (typeof p.sound === 'boolean')
                state.preferences.sound = p.sound;
            if (typeof p.haptics === 'boolean')
                state.preferences.haptics = p.haptics;
            if (['system', 'en', 'fr', 'es'].includes(p.language as string))
                state.preferences.language = p.language as Language;
        }
        if (object(data.dailyCompletions))
            state.dailyCompletions = Object.fromEntries(Object.entries(data.dailyCompletions).filter(([key, value]) => isUtcDate(key) && result(value) && value.mode === 'daily' && value.date === key)) as Record<string, GameResult>;
        if (result(data.lastResult))
            state.lastResult = data.lastResult;
        return { state, warning: null, writable: true };
    }
    catch {
        return { state, warning: 'recovered', writable: true };
    }
}
