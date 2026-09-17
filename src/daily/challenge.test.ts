import { dailyChallenge, isUtcDate, utcDate } from './challenge';
const catalog = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
test('same UTC day always selects the same existing level', () => {
    const morning = dailyChallenge(new Date('2026-09-17T00:00:00Z'), catalog);
    expect(dailyChallenge(new Date('2026-09-17T23:59:59Z'), catalog)).toEqual(morning);
    expect(catalog.some(level => level.id === morning.levelId)).toBe(true);
});
test('selection rotates at UTC midnight with a fixed known baseline', () => {
    expect(dailyChallenge(new Date('1970-01-01T00:00:00Z'), catalog).levelId).toBe('a');
    expect(dailyChallenge(new Date('1970-01-02T00:00:00Z'), catalog).levelId).toBe('b');
    expect(dailyChallenge(new Date('1970-01-04T00:00:00Z'), catalog).levelId).toBe('a');
});
test('timezone offsets resolve to the UTC date', () => {
    expect(utcDate(new Date('2026-09-18T01:00:00+02:00'))).toBe('2026-09-17');
    expect(dailyChallenge(new Date('2026-09-18T01:00:00+02:00'), catalog)).toEqual(dailyChallenge(new Date('2026-09-17T23:00:00Z'), catalog));
});
test('empty catalogs fail explicitly; a single level remains stable', () => {
    expect(() => dailyChallenge(new Date(), [])).toThrow('requires levels');
    expect(dailyChallenge(new Date(), [{ id: 'only' }]).levelId).toBe('only');
});
test('invalid dates are rejected', () => {
    expect(isUtcDate('2026-02-30')).toBe(false);
    expect(isUtcDate('2026-2-3')).toBe(false);
    expect(isUtcDate('2028-02-29')).toBe(true);
    expect(isUtcDate(null)).toBe(false);
    expect(() => dailyChallenge(new Date('invalid'), catalog)).toThrow();
});
