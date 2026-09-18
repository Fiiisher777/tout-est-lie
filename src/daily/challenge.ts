import { resolveScheduledDaily, type DailyAssignment } from './schedule';
import { packs } from '../game/content';
import type { Locale } from '../game/content/schema';
export function utcDate(date = new Date()): string { return date.toISOString().slice(0, 10); }
export function isUtcDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && utcDate(date) === value;
}
// Development-only fixed daily assignment. Never rotate against mutable normal packs.
// Replace with immutable date -> locale -> puzzle/revision assignments for production.
export function dailyChallenge(date = new Date(), locale: Locale = 'en', schedule?: readonly DailyAssignment[]) {
  const day = utcDate(date);
  if (schedule) {
    const scheduled = resolveScheduledDaily(day, locale, schedule);
    if (!scheduled || scheduled.mode !== 'daily') throw new Error('Daily challenge unavailable');
    return scheduled;
  }
  const puzzle = packs.find(p => p.locale === locale && p.purpose === 'daily')?.puzzles[0];
  if (!puzzle) throw new Error('Daily challenge unavailable');
  return { mode: 'daily' as const, date: day, levelId: puzzle.levelId, locale, puzzleRevision: puzzle.revision };
}
