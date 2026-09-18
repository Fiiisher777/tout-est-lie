import { packs, puzzles } from '../content';
import { validateCatalog, validatePuzzle } from './validate';
import type { Puzzle } from './schema';
const clone = (): Puzzle => JSON.parse(JSON.stringify(puzzles[0]));
test.each(puzzles.map(p => [p.levelId, p] as const))('development fixture %s passes structural validation', (_, p) => { expect(validatePuzzle(p)).toEqual([]); });
test('all development packs validate together', () => { expect(validateCatalog(packs)).toEqual([]); });
const malformed: [string, (p: Puzzle) => void][] = [
  ['card count', p => p.cards.pop()], ['duplicate label', p => { p.cards[1].text = '  ' + p.cards[0].text.toLowerCase() + ' '; }],
  ['group count', p => p.groups.pop()], ['group size', p => p.groups[0].cardIds.pop()], ['card ID', p => { p.cards[1].id = p.cards[0].id; }],
  ['group ID', p => { p.groups[1].id = p.groups[0].id; }], ['difficulty', p => { p.difficulty = 0 as Puzzle['difficulty']; }],
  ['locale', p => { p.locale = 'de' as Puzzle['locale']; }], ['multiple/unassigned', p => { p.groups[0].cardIds[0] = 'c4'; }],
  ['unknown card', p => { p.groups[0].cardIds[0] = 'missing'; }], ['hint ID', p => { p.hints[1].id = p.hints[0].id; }],
  ['hint membership', p => { p.hints[0] = { id: 'x', kind: 'pair', groupId: 'g0', cardIds: ['c0', 'c4'] }; }],
  ['hint clue', p => { p.hints[0] = { id: 'x', kind: 'category', groupId: 'g0', text: '' }; }],
  ['hint kind', p => { (p.hints[0] as unknown as { kind: string }).kind = 'eliminate'; }],
  ['review revision', p => { p.review = { status: 'approved', reviewedRevision: 2, reviewer: 'test' }; }],
];
test.each(malformed)('malformed fixture rejected: %s', (_, mutate) => { const p = clone(); mutate(p); expect(validatePuzzle(p).length).toBeGreaterThan(0); });
test.each([null, [], {}, { cards: [null], groups: [null], hints: [null] }])('malformed unknown shape does not crash validator', p => { expect(validatePuzzle(p).length).toBeGreaterThan(0); });
test('Unicode-equivalent visible labels are duplicates', () => { const p = clone(); p.cards[0].text = 'É'; p.cards[1].text = 'E\u0301'; expect(validatePuzzle(p).length).toBeGreaterThan(0); });
test('missing locales, duplicate puzzle IDs, stale sources fail catalog validation', () => {
  expect(validateCatalog([packs[0]])).not.toEqual([]); expect(validateCatalog([...packs, packs[0]])).not.toEqual([]);
  const copy = JSON.parse(JSON.stringify(packs)) as typeof packs; copy[0].puzzles[0].localization = { kind: 'translated-equivalent', sourceLevelId: 'fr-easy', sourceRevision: 99 }; expect(validateCatalog(copy)).not.toEqual([]);
});
test('development fixtures cannot pass production approval gate', () => { expect(validateCatalog(packs, true)).not.toEqual([]); });
