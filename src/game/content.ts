import production from '../../content/production/puzzles.json';
import released from '../../content/production/released.json';
import type { Locale, Pack } from './content/schema';
import { releasePacks } from './content/production/release';
// Release builds always use the approval gate. Development fixtures are an
// explicit separate source; preview production with EXPO_PUBLIC_PUZZLE_CONTENT=production.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro removes the development-only branch from release builds.
const loadDevelopment = () => (require('./content/development') as typeof import('./content/development')).developmentPacks;
export const packs: Pack[] = __DEV__ && process.env.EXPO_PUBLIC_PUZZLE_CONTENT !== 'production'
  ? loadDevelopment()
  : releasePacks(production, released);
export function hasDailyContent(locale: Locale) { return packs.some(p => p.locale === locale && p.purpose === 'daily' && p.puzzles.length > 0); }
export const puzzles = packs.flatMap(p => p.puzzles);
export function levelsFor(locale: Locale) {
  return packs.filter(p => p.locale === locale && p.purpose === 'normal').flatMap(p => p.entries.map(e => ({ id: e.levelId, number: e.number! })));
}
export function findLevel(id: string) { return packs.filter(p => p.purpose === 'normal').flatMap(p => p.entries).map(e => ({ id: e.levelId, number: e.number! })).find(e => e.id === id); }
export function findPuzzle(id: string) { return puzzles.find(p => p.levelId === id); }
