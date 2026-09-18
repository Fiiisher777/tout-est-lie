import enNormal from './content/packs/en-normal.json';
import frNormal from './content/packs/fr-normal.json';
import esNormal from './content/packs/es-normal.json';
import enDaily from './content/packs/en-daily.json';
import frDaily from './content/packs/fr-daily.json';
import esDaily from './content/packs/es-daily.json';
import type { Locale, Pack } from './content/schema';
import { validateCatalog } from './content/validate';
export const packs = [enNormal, frNormal, esNormal, enDaily, frDaily, esDaily] as Pack[];
const issues = validateCatalog(packs);
if (issues.length) throw new Error(JSON.stringify(issues));
export const puzzles = packs.flatMap(p => p.puzzles);
export function levelsFor(locale: Locale) {
  return packs.filter(p => p.locale === locale && p.purpose === 'normal').flatMap(p => p.entries.map(e => ({ id: e.levelId, number: e.number! })));
}
export function findLevel(id: string) { return packs.filter(p => p.purpose === 'normal').flatMap(p => p.entries).map(e => ({ id: e.levelId, number: e.number! })).find(e => e.id === id); }
export function findPuzzle(id: string) { return puzzles.find(p => p.levelId === id); }
