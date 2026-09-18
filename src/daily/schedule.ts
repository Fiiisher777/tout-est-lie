import type { Locale, Puzzle } from '../game/content/schema';
import type { GameLaunch } from '../game/types';
export type DailyAssignment = { date: string; puzzles: Record<Locale, { levelId: string; revision: number }> };
export function resolveScheduledDaily(date: string, locale: Locale, schedule: readonly DailyAssignment[]): GameLaunch | null {
  const entry = schedule.find(e => e.date === date)?.puzzles[locale];
  return entry ? { mode: 'daily', date, levelId: entry.levelId, puzzleRevision: entry.revision, locale } : null;
}
export function validateDailySchedule(schedule: readonly DailyAssignment[], dailyPuzzles: readonly Puzzle[]): string[] {
  const errors: string[] = []; const dates = new Set<string>();
  for (const assignment of schedule) {
    const parsed = new Date(`${assignment.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(assignment.date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== assignment.date || dates.has(assignment.date)) errors.push('Invalid or duplicate UTC date');
    dates.add(assignment.date);
    for (const locale of ['en', 'fr', 'es'] as const) {
      const reference = assignment.puzzles[locale];
      if (!reference || !dailyPuzzles.some(p => p.levelId === reference.levelId && p.revision === reference.revision && p.locale === locale)) errors.push(`Missing or stale daily puzzle for ${locale}`);
    }
  }
  return errors;
}
