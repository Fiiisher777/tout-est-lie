import type { GameResult } from '../game/types';
export type Language = 'system' | 'en' | 'fr' | 'es';
export type Preferences = {
    sound: boolean;
    haptics: boolean;
    language: Language;
};
export type PlayerState = {
    version: 1;
    completedLevels: string[];
    bestResults: Record<string, number>;
    dailyCompletions: Record<string, GameResult>;
    preferences: Preferences;
    lastResult: GameResult | null;
};
export function defaultPlayer(): PlayerState {
    return { version: 1, completedLevels: [], bestResults: {}, dailyCompletions: {},
        preferences: { sound: true, haptics: true, language: 'system' }, lastResult: null };
}
export type PlayerAction = {
    type: 'hydrate';
    state: PlayerState;
} | {
    type: 'preferences';
    value: Partial<Preferences>;
} | {
    type: 'complete';
    result: GameResult;
} | {
    type: 'resetProgress';
};
export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
    switch (action.type) {
        case 'hydrate': return action.state;
        case 'preferences': return { ...state, preferences: { ...state.preferences, ...action.value } };
        case 'resetProgress': return { ...defaultPlayer(), preferences: { ...state.preferences } };
        case 'complete': {
            const result = action.result;
            if (!Number.isFinite(result.score) || result.score < 0)
                return state;
            if (state.lastResult?.id === result.id)
                return state;
            if (result.mode === 'daily') {
                const previous = state.dailyCompletions[result.date];
                return { ...state, lastResult: result, dailyCompletions: {
                        ...state.dailyCompletions, [result.date]: !previous || result.score > previous.score ? result : previous,
                    } };
            }
            return { ...state, lastResult: result,
                completedLevels: [...new Set([...state.completedLevels, result.levelId])],
                bestResults: { ...state.bestResults, [result.levelId]: Math.max(state.bestResults[result.levelId] ?? 0, result.score) } };
        }
    }
}
