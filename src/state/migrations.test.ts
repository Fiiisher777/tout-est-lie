import { migratePlayer } from './migrations';
import { defaultPlayer } from './player';
test('missing save gets defaults', () => { expect(migratePlayer(null).state).toEqual(defaultPlayer()); });
test.each(['{broken', 'null', '[]', '42', '{"version":-1}'])('invalid save %s recovers', raw => { expect(migratePlayer(raw).warning).toBe('recovered'); });
test('version two round trips', () => { const s = defaultPlayer(); s.completedLevels = ['en-easy']; expect(migratePlayer(JSON.stringify(s)).state).toEqual(s); });
test.each([0, 1])('starter version %s retains preferences, clears demo progress', version => { const migrated = migratePlayer(JSON.stringify({ version, completedLevels: ['level-1'], preferences: { sound: false, haptics: false, language: 'es' } })); expect(migrated.state).toEqual({ ...defaultPlayer(), preferences: { sound: false, haptics: false, language: 'es' } }); });
test('future versions are protected', () => { expect(migratePlayer('{"version":3}').writable).toBe(false); });
test('malformed results and unsafe IDs are discarded', () => { const s = migratePlayer(JSON.stringify({ version: 2, completedLevels: ['__proto__', 'en-easy', 'en-easy'], lastResult: {}, dailyCompletions: { bad: {} } })).state; expect(s.completedLevels).toEqual(['en-easy']); expect(s.lastResult).toBeNull(); expect(s.dailyCompletions).toEqual({}); });
