import { dailyChallenge, isUtcDate, utcDate } from './challenge';
import { levelsFor } from '../game/content';
test.each(['fr', 'en', 'es'] as const)('daily is stable and dedicated for %s', locale => {
  const a = dailyChallenge(new Date('2026-09-17T00:00:00Z'), locale); expect(dailyChallenge(new Date('2026-09-17T23:59:59Z'), locale)).toEqual(a);
  expect(levelsFor(locale).some(l => l.id === a.levelId)).toBe(false);
});
test('UTC date advances at midnight; prior launch stays pinned', () => { const old = dailyChallenge(new Date('2026-09-17T23:59:59Z')); expect(dailyChallenge(new Date('2026-09-18T00:00:00Z')).date).toBe('2026-09-18'); expect(old.date).toBe('2026-09-17'); });
test('timezone offsets resolve to UTC date', () => { expect(utcDate(new Date('2026-09-18T01:00:00+02:00'))).toBe('2026-09-17'); });
test('invalid dates are rejected', () => { expect(isUtcDate('2026-02-30')).toBe(false); expect(isUtcDate('2028-02-29')).toBe(true); expect(isUtcDate(null)).toBe(false); expect(() => dailyChallenge(new Date('invalid'))).toThrow(); });
