import { packs } from '../game/content';
import { resolveScheduledDaily, validateDailySchedule, type DailyAssignment } from './schedule';
const assignment: DailyAssignment = { date: '2026-09-17', puzzles: { en: { levelId: 'en-daily', revision: 1 }, fr: { levelId: 'fr-daily', revision: 1 }, es: { levelId: 'es-daily', revision: 1 } } };
const daily = packs.filter(p => p.purpose === 'daily').flatMap(p => p.puzzles);
test('scheduled assignments resolve locale-specific puzzle/revision', () => { expect(validateDailySchedule([assignment], daily)).toEqual([]); expect(resolveScheduledDaily(assignment.date, 'fr', [assignment])).toMatchObject({ levelId: 'fr-daily', locale: 'fr', puzzleRevision: 1 }); });
test('missing date is unavailable rather than a normal fallback', () => { expect(resolveScheduledDaily('2026-09-18', 'en', [assignment])).toBeNull(); });
test('duplicate dates, wrong revision and normal puzzle references are rejected', () => { expect(validateDailySchedule([assignment, assignment], daily)).not.toEqual([]); expect(validateDailySchedule([{ ...assignment, puzzles: { ...assignment.puzzles, en: { levelId: 'en-easy', revision: 1 } } }], daily)).not.toEqual([]); expect(validateDailySchedule([{ ...assignment, puzzles: { ...assignment.puzzles, en: { levelId: 'en-daily', revision: 2 } } }], daily)).not.toEqual([]); });
