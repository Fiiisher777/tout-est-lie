import type { Pack } from '../schema';
import { approvalCurrent, locales, toEnginePuzzle, type ProductionPuzzle, type ReleasedRevision } from './schema';
import { validateProduction, validateProductionPuzzle } from './validate';
// Fail closed on catalog conflicts, while allowing structurally valid partial
// packs and excluding every draft/rejected/stale record from playable content.
export function releasePuzzles(input: unknown, released: readonly ReleasedRevision[] = []): ProductionPuzzle[] {
  if (!Array.isArray(input)) return [];
  const candidates = input.filter(p => validateProductionPuzzle(p).length === 0) as ProductionPuzzle[];
  // Inspect original input too: a malformed duplicate must not shadow an ID.
  const issues = validateProduction(input, released);
  if (issues.some(i => i.path === 'released' || i.path === '')) return [];
  const blocked = new Set(candidates.filter(p => issues.some(i => i.path === p.levelId || i.path.startsWith(`${p.levelId}.`) || i.path === `${p.locale}:${p.position}`)).map(p => p.levelId));
  return candidates.filter(p => !blocked.has(p.levelId) && approvalCurrent(p));
}
export function releasePacks(input: unknown, released: readonly ReleasedRevision[] = []): Pack[] {
  const puzzles = releasePuzzles(input, released);
  return locales.map(locale => {
    const local = puzzles.filter(p => p.locale === locale).sort((a, b) => a.position - b.position);
    return { packId: `production-${locale}-normal`, locale, purpose: 'normal', entries: local.map(p => ({ levelId: p.levelId, number: p.position })), puzzles: local.map(toEnginePuzzle) };
  });
}
