import source from '../../../../nodi-fr-11-35-curated-source.json';
import catalog from '../../../../content/production/puzzles.json';
import prior from '../../../../content/production/history/catalog-before-fr-curated-11-35.json';
import { validateProduction, validateProductionPuzzle, releaseCheck } from './validate';
import { releasePuzzles } from './release';
import { toEnginePuzzle, type ProductionPuzzle } from './schema';
const curated = catalog.filter(p => p.locale === 'fr' && p.position >= 11 && p.position <= 35);
test('active FR catalog contains exactly positions 1–35 with no duplicate IDs or positions', () => {
  expect(curated).toHaveLength(25);
  expect(catalog.filter(p => p.locale === 'fr').map(p => p.position).sort((a,b) => a-b)).toEqual(Array.from({length:35},(_,i)=>i+1));
  expect(new Set(catalog.map(p => p.levelId)).size).toBe(catalog.length);
  expect(validateProduction(catalog)).toEqual([]);
});
test.each(source.puzzles)('position $position preserves authoritative content and has valid authored hints', original => {
  const p = curated.find(p => p.position === original.position)!;
  expect(p).toMatchObject({ locale: 'fr', difficulty: 2, status: 'draft', knownDecoys: original.knownDecoys, ambiguityNotes: original.ambiguityNotes, editorialNotes: original.editorialNotes, provenance: { sourceFile: 'nodi-fr-11-35-curated-source.json', sourceCandidate: original.sourceCandidate } });
  expect(p.cards.map(c => c.text)).toEqual(original.cards);
  expect(p.cards).toHaveLength(16); expect(new Set(p.cards.map(c => c.text.normalize('NFC').trim().toLocaleLowerCase('fr'))).size).toBe(16);
  expect(p.groups).toHaveLength(4);
  expect(p.groups.map(g => ({ label: g.label, intendedReason: g.intendedReason, cards: g.cardIds.map(id => p.cards.find(c => c.id === id)!.text) }))).toEqual(original.groups);
  for (const group of p.groups) expect(group.cardIds).toHaveLength(4);
  expect(p.groups.flatMap(g => g.cardIds).sort()).toEqual(p.cards.map(c => c.id).sort());
  expect(p.hints.some(h => h.kind === 'pair')).toBe(true); expect(p.hints.some(h => h.kind === 'category')).toBe(true);
  for (const h of p.hints) {
    const group = p.groups.find(g => g.id === h.groupId)!;
    expect(group).toBeDefined();
    if (h.kind === 'pair') { expect(h.cardIds).toHaveLength(2); expect(new Set(h.cardIds).size).toBe(2); expect(h.cardIds!.every(id => group.cardIds.includes(id))).toBe(true); }
    else { expect(h.text?.trim()).toBeTruthy(); expect(group.cardIds.every(id => h.text!.includes(p.cards.find(c => c.id === id)!.text))).toBe(false); }
  }
  expect(validateProductionPuzzle(p)).toEqual([]);
  expect(toEnginePuzzle(p as ProductionPuzzle)).not.toHaveProperty('provenance');
  expect(toEnginePuzzle(p as ProductionPuzzle)).not.toHaveProperty('editorialNotes');
});
test('superseded drafts keep IDs and increment revisions; new positions start at revision one', () => {
  for (const p of curated) {
    const old = prior.find(q => q.locale === 'fr' && q.position === p.position);
    expect(p.revision).toBe(old ? old.revision + 1 : 1);
    if (old) expect(p.levelId).toBe(old.levelId);
    expect(p.status).toBe('draft'); expect(p).not.toHaveProperty('review');
  }
});
test('production excludes all curated drafts and release blockers are editorial incompleteness only', () => {
  expect(releasePuzzles(catalog)).toEqual([]);
  const errors = releaseCheck(catalog);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors.every(e => e.message === 'Missing level position' || e.message.startsWith('Unapproved puzzle:'))).toBe(true);
  for (const p of curated) expect(errors.some(e => e.path === p.levelId && e.message.startsWith('Unapproved puzzle:'))).toBe(true);
});
test('optional authoring metadata is validated without becoming gameplay data', () => {
  expect(validateProductionPuzzle({...curated[0],provenance:{sourceFile:'',sourceCandidate:0}}).some(e=>e.path==='provenance')).toBe(true);
  expect(validateProductionPuzzle({...curated[0],editorialNotes:42}).some(e=>e.path==='editorialNotes')).toBe(true);
});
