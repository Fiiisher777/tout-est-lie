import { migratePlayer } from './migrations';
import { defaultPlayer } from './player';
test('missing save gets safe defaults', () => { expect(migratePlayer(null)).toEqual({ state: defaultPlayer(), warning: null, writable: true }); });
test.each(['{broken', 'null', '[]', '42', '{"version":-1}'])('invalid save %s recovers', raw => {
    expect(migratePlayer(raw)).toEqual({ state: defaultPlayer(), warning: 'recovered', writable: true });
});
test('version one round trips', () => {
    const state = defaultPlayer();
    state.completedLevels = ['level-1'];
    state.bestResults = { 'level-1': 0 };
    state.preferences.language = 'fr';
    expect(migratePlayer(JSON.stringify(state)).state).toEqual(state);
});
test('version zero migrates without losing settings or results', () => {
    const state = { ...defaultPlayer(), version: 0, completedLevels: ['level-2'], preferences: { sound: false, haptics: false, language: 'es' } };
    expect(migratePlayer(JSON.stringify(state)).state).toEqual({ ...state, version: 1, lastResult: null });
});
test('partial and malformed fields default safely', () => {
    const loaded = migratePlayer(JSON.stringify({ version: 1, completedLevels: ['level-1', 'level-1', null, '__proto__'], bestResults: { good: 2, bad: -1, invalid: '3' }, preferences: { sound: 'false', haptics: false, language: 'zz' }, dailyCompletions: { '2026-02-30': {} }, lastResult: {} }));
    expect(loaded.state.completedLevels).toEqual(['level-1']);
    expect(loaded.state.bestResults).toEqual({ good: 2 });
    expect(loaded.state.preferences).toEqual({ sound: true, haptics: false, language: 'system' });
    expect(loaded.state.dailyCompletions).toEqual({});
    expect(loaded.state.lastResult).toBeNull();
});
test('future versions cannot be overwritten', () => {
    expect(migratePlayer('{"version":2}')).toEqual({ state: defaultPlayer(), warning: 'futureVersion', writable: false });
});
test('valid daily results survive and mismatched dates are rejected', () => {
    const result = { id: 'daily-1', mode: 'daily', date: '2026-09-17', levelId: 'level-2', score: 5, completedAt: '2026-09-17T12:00:00Z' };
    const loaded = migratePlayer(JSON.stringify({ version: 1, dailyCompletions: { '2026-09-17': result, '2026-09-18': result }, lastResult: result }));
    expect(loaded.state.dailyCompletions).toEqual({ '2026-09-17': result });
    expect(loaded.state.lastResult).toEqual(result);
});
