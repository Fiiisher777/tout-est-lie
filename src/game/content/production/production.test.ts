import samples from './__fixtures__/samples.json';
import { approvalContent, approvalCurrent, locales, toEnginePuzzle, type ProductionPuzzle } from './schema';
import { approvePuzzle, releaseCheck, importDrafts, validateProduction, validateProductionPuzzle } from './validate';
import { releasePacks, releasePuzzles } from './release';
import { editorialReport, productionSummary } from './report';
import { validatePuzzle } from '../validate';
const draft = (): ProductionPuzzle => JSON.parse(JSON.stringify(samples[0]));
const approve = (p = draft()) => approvePuzzle({ ...p, status: 'editorial_review' }, 'Test editor', '2026-09-18T10:00:00.000Z');
const messages = (input: unknown) => validateProduction(input).map(i => i.message).join('\n');
test.each(['draft', 'structurally_valid', 'editorial_review'] as const)('%s passes structural validation without approval', status => {
  const p = { ...draft(), status }; const before = JSON.stringify(p);
  expect(validateProduction([p])).toEqual([]); expect(releasePuzzles([p])).toEqual([]); expect(JSON.stringify(p)).toBe(before);
});
test('unknown statuses and rejected puzzles without reasons fail', () => {
  expect(validateProductionPuzzle({ ...draft(), status: 'ready' })).not.toEqual([]);
  expect(validateProductionPuzzle({ ...draft(), status: 'rejected' })).not.toEqual([]);
  expect(validateProductionPuzzle({ ...draft(), status: 'rejected', rejectionReason: 'Ambiguous partition' })).toEqual([]);
});
test('approval is an explicit action from editorial review with reviewer metadata', () => {
  expect(() => approvePuzzle(draft(), 'Reviewer', '2026-09-18T10:00:00.000Z')).toThrow('editorial_review');
  expect(() => approvePuzzle({ ...draft(), status: 'editorial_review' }, '', 'invalid')).toThrow();
  expect(validateProductionPuzzle({ ...draft(), status: 'approved' })).not.toEqual([]);
  expect(approvalCurrent(approve())).toBe(true);
});
test('invalid content cannot be approved', () => {
  const p = draft(); p.cards.pop(); expect(() => approve(p)).toThrow('structural');
});
test('approval becomes stale after revision changes', () => {
  const p = approve(); p.revision++;
  expect(approvalCurrent(p)).toBe(false); expect(releasePuzzles([p])).toEqual([]);
  expect(messages([p])).toContain('stale');
});
test('content edits invalidate approval even without a revision bump', () => {
  const p = approve(); p.cards[0].text = 'EDITED WORD';
  expect(approvalCurrent(p)).toBe(false); expect(releasePuzzles([p])).toEqual([]);
});
test('JSON key order does not invalidate the reviewed content', () => {
  const p = approve(); const reordered = Object.fromEntries(Object.entries(p).reverse()) as ProductionPuzzle;
  expect(approvalCurrent(reordered)).toBe(true);
});
test.each(['draft', 'rejected'] as const)('release loader excludes %s even with valid previous approval data', status => {
  const p = { ...approve(), status, rejectionReason: 'Not suitable' };
  expect(releasePuzzles([p])).toEqual([]);
});
test('valid explicitly approved puzzle is included and projects to unchanged engine schema', () => {
  const p = approve(); expect(releasePuzzles([p])).toEqual([p]);
  expect(validatePuzzle(toEnginePuzzle(p))).toEqual([]);
  const pack = releasePacks([p]).find(pack => pack.locale === p.locale)!;
  expect(pack.entries).toEqual([{ levelId: p.levelId, number: 1 }]);
  expect(pack.puzzles[0].review).toEqual({ status: 'approved', reviewedRevision: 1, reviewer: 'Test editor' });
});
test('duplicate level positions block both records even if one is a draft', () => {
  const p = approve(); const other = { ...draft(), levelId: 'another', concept: { id: 'another', relationship: 'original' as const } };
  expect(messages([p, other])).toContain('Duplicate level position'); expect(releasePuzzles([p, other])).toEqual([]);
});
test('duplicate IDs are rejected, including a malformed duplicate', () => {
  const p = approve(); const bad = { ...draft(), cards: [] };
  expect(messages([p, bad])).toContain('Duplicate puzzle ID'); expect(releasePuzzles([p, bad])).toEqual([]);
});
test.each([[1, 1], [20, 1], [21, 2], [40, 2], [41, 3], [60, 3], [61, 4], [80, 4], [81, 5], [100, 5]])('position %i requires difficulty %i', (position, difficulty) => {
  const p = { ...draft(), position, difficulty };
  expect(validateProduction([p])).toEqual([]);
  expect(messages([{ ...p, difficulty: difficulty === 5 ? 1 : difficulty + 1 }])).toContain('Incorrect difficulty');
});
test.each([0, 101, 1.5])('invalid level position %i', position => { expect(validateProduction([{ ...draft(), position }])).not.toEqual([]); });
test('all three equivalent types allow entirely different visible words', () => {
  const root = draft();
  for (const relationship of ['direct-equivalent', 'adapted-equivalent', 'locale-replacement'] as const) {
    const p = { ...draft(), levelId: 'different-fr', locale: 'fr' as const, concept: { id: root.concept.id, relationship, source: { puzzleId: root.levelId, revision: 1 } }, cards: root.cards.map((c, i) => ({ ...c, text: `DIFFERENT ${i}` })) };
    expect(validateProduction([root, p])).toEqual([]);
  }
});
test.each(['missing', 'stale', 'cycle', 'concept', 'same-locale'])('broken equivalence %s is reported', failure => {
  const root = draft(); const translated = JSON.parse(JSON.stringify(samples[1])) as ProductionPuzzle;
  if (failure === 'missing') translated.concept.source!.puzzleId = 'missing';
  if (failure === 'stale') translated.concept.source!.revision = 2;
  if (failure === 'cycle') root.concept = { ...root.concept, relationship: 'direct-equivalent', source: { puzzleId: translated.levelId, revision: 1 } };
  if (failure === 'concept') translated.concept.id = 'unrelated';
  if (failure === 'same-locale') translated.locale = root.locale;
  expect(messages([root, translated])).toContain('Broken equivalence');
});
test('partial pack is allowed during development; report identifies missing positions and locales', () => {
  expect(validateProduction([draft()])).toEqual([]);
  const summary = productionSummary([draft()]);
  expect(summary.locales.en.missingPositions).toHaveLength(99); expect(summary.locales.fr.missingPositions).toHaveLength(100);
  expect(summary.releaseReady).toBe(false); expect(releaseCheck([draft()]).some(i => i.message === 'Missing locale coverage')).toBe(true);
});
test('three sample drafts cannot become release content', () => {
  expect(samples).toHaveLength(3); expect(samples.every(p => p.status === 'draft')).toBe(true);
  expect(validateProduction(samples)).toEqual([]); expect(releasePuzzles(samples)).toEqual([]);
});
test('strict release needs exactly 100 approved positions per locale', () => {
  // Synthetic fixtures exercise the gate, not authored production content.
  const full = locales.flatMap(locale => Array.from({ length: 100 }, (_, i) => approve({ ...draft(), levelId: `test-${locale}-${i + 1}`, locale, position: i + 1, difficulty: Math.ceil((i + 1) / 20) as ProductionPuzzle['difficulty'], concept: { id: `test-${locale}-${i + 1}`, relationship: 'original' } })));
  expect(releaseCheck(full)).toEqual([]); expect(releasePuzzles(full)).toHaveLength(300);
  expect(releaseCheck(full.slice(1))).not.toEqual([]);
  expect(releaseCheck(full.map((p, i) => i ? p : { ...p, status: 'draft' }))).not.toEqual([]);
});
test('published revision cannot regress or silently change; incrementing permits a fresh review', () => {
  const p = approve(); const baseline = [{ puzzleId: p.levelId, revision: 1, content: approvalContent(p) }];
  expect(validateProduction([p], baseline)).toEqual([]);
  const edited = { ...p, rationale: 'Changed rationale', status: 'editorial_review' as const };
  expect(validateProduction([edited], baseline).some(i => i.message.includes('published revision edited'))).toBe(true);
  expect(validateProduction([{ ...edited, revision: 2 }], baseline)).toEqual([]);
  expect(validateProduction([], baseline)).not.toEqual([]);
});
test('reports show all editorial information and do not mutate records', () => {
  const before = JSON.stringify(samples); const report = editorialReport(samples);
  for (const text of ['TOTAL PUZZLES: 3', 'FR', 'EN', 'ES', 'Counts by status', 'Counts by difficulty', 'Structural errors', 'Equivalence coverage', 'NOT READY', 'Visible cards', 'Intended groups', 'Intended reason', 'Known decoys', 'Ambiguity notes', 'Hints', 'SAMPLE DRAFT ONLY', samples[0].cards[0].text]) expect(report).toContain(text);
  expect(JSON.stringify(samples)).toBe(before);
});
test.each([null, {}, [null], [{ levelId: 'broken', review: { reviewedBy: 123 }, status: 'approved', cards: [null], groups: [null], hints: [null] }]])('malformed input is reported safely', input => {
  expect(validateProduction(input)).not.toEqual([]); expect(() => editorialReport(input)).not.toThrow(); expect(releasePuzzles(input)).toEqual([]);
});
test('production metadata and both hint kinds are required', () => {
  const p = draft(); p.hints = p.hints.filter(h => h.kind !== 'category'); p.groups[0].intendedReason = ''; p.rationale = '';
  expect(messages([p])).toContain('CATEGORY'); expect(messages([p])).toContain('intendedReason'); expect(messages([p])).toContain('editorial text');
});

test('AI batch imports strip approval claims and always become drafts', () => {
  const source = approve();
  const imported = importDrafts([], [source]);
  expect(imported[0].status).toBe('draft'); expect(imported[0].review).toBeUndefined();
  expect(releasePuzzles(imported)).toEqual([]); expect(source.status).toBe('approved');
});
test('batch validation is atomic and does not mutate existing content', () => {
  const existing = [draft()]; const before = JSON.stringify(existing);
  expect(() => importDrafts(existing, [draft()])).toThrow('Duplicate');
  expect(JSON.stringify(existing)).toBe(before);
});
test('a malformed release baseline fails closed', () => {
  expect(releasePuzzles([approve()], [{ puzzleId: 'bad', revision: 0, content: '' }])).toEqual([]);
});
test('review timestamps must be real canonical UTC instants', () => {
  expect(() => approvePuzzle({ ...draft(), status: 'editorial_review' }, 'Reviewer', '2026-02-30T10:00:00.000Z')).toThrow();
});
