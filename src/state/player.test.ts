import { defaultPlayer, playerReducer } from './player';
import type { GameResult } from '../game/types';
const completion: GameResult = { mode: 'level', levelId: 'level-1', id: 'first', score: 10, completedAt: '2026-09-17T12:00:00Z' };
test('defaults are independent and preferences can change without touching progress', () => {
    const first = defaultPlayer();
    const second = defaultPlayer();
    const changed = playerReducer(first, { type: 'preferences', value: { sound: false, language: 'fr' } });
    expect(changed.preferences).toEqual({ sound: false, haptics: true, language: 'fr' });
    expect(second.preferences.sound).toBe(true);
    expect(first.preferences.sound).toBe(true);
});
test('normal completions are deduplicated and preserve the highest score', () => {
    const first = playerReducer(defaultPlayer(), { type: 'complete', result: completion });
    const repeated = playerReducer(first, { type: 'complete', result: completion });
    expect(repeated).toBe(first);
    const lower = playerReducer(first, { type: 'complete', result: { ...completion, id: 'second', score: 2 } });
    expect(lower.completedLevels).toEqual(['level-1']);
    expect(lower.bestResults['level-1']).toBe(10);
    const higher = playerReducer(lower, { type: 'complete', result: { ...completion, id: 'third', score: 20 } });
    expect(higher.bestResults['level-1']).toBe(20);
    expect(first.bestResults['level-1']).toBe(10);
});
test('daily completions do not complete normal levels and keep the best daily result', () => {
    const daily: GameResult = { ...completion, mode: 'daily', date: '2026-09-17' };
    const first = playerReducer(defaultPlayer(), { type: 'complete', result: daily });
    const lower = playerReducer(first, { type: 'complete', result: { ...daily, id: 'retry', score: 1 } });
    expect(lower.completedLevels).toEqual([]);
    expect(lower.bestResults).toEqual({});
    expect(lower.dailyCompletions['2026-09-17'].score).toBe(10);
    expect(lower.lastResult?.score).toBe(1);
});
test('reset clears all progress and last result but preserves settings', () => {
    const state = playerReducer(defaultPlayer(), { type: 'complete', result: completion });
    state.preferences.language = 'es';
    state.preferences.haptics = false;
    expect(playerReducer(state, { type: 'resetProgress' })).toEqual({ ...defaultPlayer(), preferences: state.preferences });
});
test.each([NaN, Infinity, -1])('invalid score %s cannot change state', score => {
    const state = defaultPlayer();
    expect(playerReducer(state, { type: 'complete', result: { ...completion, score } })).toBe(state);
});
