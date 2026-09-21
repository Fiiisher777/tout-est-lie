import active from '../../../../content/production/puzzles.json';
import catalog from '../../../../content/production/history/catalog-before-fr-curated-11-35.json';
import released from '../../../../content/production/released.json';
import { validateProduction, validateProductionPuzzle } from './validate';
import { releasePacks, releasePuzzles } from './release';
const batch = catalog.filter(p => p.locale === 'fr');
test('first French batch contains exactly the reserved 15 positions and stable IDs', () => {
  expect(batch).toHaveLength(15);
  expect(batch.map(p => p.position).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 21, 22, 23, 24]);
  expect(new Set(batch.map(p => p.position)).size).toBe(15);
  expect(new Set(catalog.map(p => p.levelId)).size).toBe(catalog.length);
  expect(batch.map(p => p.levelId).sort()).toEqual(Array.from({ length: 15 }, (_, i) => `puzzle-fr-${String(i + 1).padStart(3, '0')}`));
  expect(validateProduction(catalog, released)).toEqual([]);
});
test.each(batch.map(p => [p.levelId, p] as const))('%s retains expected revision and draft status and valid structure', (_, puzzle) => {
  expect(puzzle.status).toBe('draft'); expect(puzzle.revision).toBe(puzzle.position === 11 ? 2 : 1);
  expect(puzzle.difficulty).toBe(puzzle.position <= 10 ? 1 : 2);
  expect(validateProductionPuzzle(puzzle)).toEqual([]);
  expect(puzzle.cards).toHaveLength(16);
  expect(new Set(puzzle.cards.map(c => c.text.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr'))).size).toBe(16);
  expect(puzzle.groups).toHaveLength(4);
  for (const group of puzzle.groups) expect(group.cardIds).toHaveLength(4);
  const members = puzzle.groups.flatMap(g => g.cardIds);
  expect([...members].sort()).toEqual(puzzle.cards.map(c => c.id).sort());
  expect(new Set(members).size).toBe(16);
  for (const hint of puzzle.hints) {
    const group = puzzle.groups.find(g => g.id === hint.groupId);
    expect(group).toBeDefined();
    if (hint.kind === 'pair') expect(hint.cardIds?.every(id => group!.cardIds.includes(id))).toBe(true);
    else expect(hint.text?.trim()).toBeTruthy();
  }
});
test('none of the French drafts is exposed through either production release loader', () => {
  expect(releasePuzzles(catalog, released)).toEqual([]);
  expect(releasePacks(catalog, released).flatMap(p => p.puzzles)).toEqual([]);
  expect(releasePacks(catalog, released).flatMap(p => p.entries)).toEqual([]);
});

test('original FR 1–10 and all EN/ES records remain exactly unchanged', () => {
  for (const original of catalog.filter(p => p.locale !== 'fr' || p.position <= 10)) expect(active.find(p => p.levelId === original.levelId)).toEqual(original);
});
