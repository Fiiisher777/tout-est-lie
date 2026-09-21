import { deriveProgression, type Progression } from './progression';
import type { GameResult } from '../game/types';
export type Language = 'system' | 'en' | 'fr' | 'es';
export type Preferences = { sound: boolean; haptics: boolean; language: Language };
export type PlayerState = { version: 3; highestUnlockedLevel: Progression; completedLevels: string[]; dailyCompletions: Record<string, GameResult>; preferences: Preferences; lastResult: GameResult | null };
export function defaultPlayer(): PlayerState { return { version: 3, highestUnlockedLevel: { fr: 1, en: 1, es: 1 }, completedLevels: [], dailyCompletions: {}, preferences: { sound: true, haptics: true, language: 'system' }, lastResult: null }; }
export type PlayerAction = { type: 'hydrate'; state: PlayerState } | { type: 'preferences'; value: Partial<Preferences> } | { type: 'complete'; result: GameResult } | { type: 'resetProgress' };
export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'hydrate': return action.state;
    case 'preferences': return { ...state, preferences: { ...state.preferences, ...action.value } };
    case 'resetProgress': return { ...defaultPlayer(), preferences: { ...state.preferences } };
    case 'complete': {
      const r = action.result;
      if (state.lastResult?.id === r.id) return state;
      if (!Number.isFinite(r.elapsedMs) || r.elapsedMs < 0 || !Number.isInteger(r.mistakes) || r.mistakes < 0 || !Number.isInteger(r.hintsUsed) || r.hintsUsed < 0 || !['won', 'lost'].includes(r.outcome)) return state;
      if ((r.penaltySeconds !== undefined && (!Number.isFinite(r.penaltySeconds) || r.penaltySeconds < 0)) || (r.rewardedContinueUsed !== undefined && typeof r.rewardedContinueUsed !== 'boolean')) return state;
      if (r.mode === 'daily') {
        const key = `${r.locale}:${r.date}`;
        return { ...state, lastResult: r, dailyCompletions: r.outcome === 'won' && !state.dailyCompletions[key] ? { ...state.dailyCompletions, [key]: r } : state.dailyCompletions };
      }
      const completedLevels = r.outcome === 'won' ? [...new Set([...state.completedLevels, r.levelId])] : state.completedLevels;
      return { ...state, lastResult: r, completedLevels, highestUnlockedLevel: deriveProgression(completedLevels, state.highestUnlockedLevel) };
    }
  }
}
