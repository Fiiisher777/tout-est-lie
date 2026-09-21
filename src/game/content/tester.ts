import { isTester } from '../../config/environment';
import type { Pack } from './schema';
import { validateProduction } from './production/validate';
import { toEnginePuzzle, type ProductionPuzzle } from './production/schema';
// Deliberate allowlist: only this French batch, never a general draft bypass.
export function testerPacks(input: unknown): Pack[] {
  if (!isTester || validateProduction(input).length || !Array.isArray(input)) return [];
  const selected = (input as ProductionPuzzle[]).filter(p => p.locale === 'fr' && p.position >= 1 && p.position <= 35 && p.status === 'draft').sort((a, b) => a.position - b.position);
  if (selected.length !== 35) return [];
  return [{ packId: 'tester-fr-normal', locale: 'fr', purpose: 'normal',
    entries: selected.map(p => ({ levelId: p.levelId, number: p.position })),
    // Independent runtime data: gameplay can never mutate authoring records.
    puzzles: selected.map(p => JSON.parse(JSON.stringify(toEnginePuzzle(p)))) }];
}
