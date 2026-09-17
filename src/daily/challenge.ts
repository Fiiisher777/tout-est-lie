import { levels } from '../game/content';
export function utcDate(date = new Date()): string { return date.toISOString().slice(0, 10); }
export function isUtcDate(value: unknown): value is string {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && utcDate(date) === value;
}
// Stable UTC-day rotation. Changing catalog order changes future selections.
export function dailyChallenge(date = new Date(), catalog: readonly {
    id: string;
}[] = levels) {
    if (!catalog.length)
        throw new Error('Daily challenge requires levels');
    const day = utcDate(date);
    const dayIndex = Math.floor(new Date(day + 'T00:00:00Z').getTime() / 86400000);
    return { mode: 'daily' as const, date: day, levelId: catalog[((dayIndex % catalog.length) + catalog.length) % catalog.length].id };
}
