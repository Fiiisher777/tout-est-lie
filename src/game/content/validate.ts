import type { Pack, Puzzle } from './schema';
export type Issue = { path: string; message: string };
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
const id = (x: unknown): x is string => text(x) && /^[a-zA-Z0-9_-]+$/.test(x) && !['__proto__', 'constructor', 'prototype'].includes(x);
export function validatePuzzle(input: unknown): Issue[] {
  const issues: Issue[] = [];
  const check = (ok: unknown, path: string, message: string) => { if (!ok) issues.push({ path, message }); };
  if (!object(input)) return [{ path: '', message: 'Expected puzzle object' }];
  check(input.schemaVersion === 1, 'schemaVersion', 'Unsupported schema');
  check(id(input.levelId), 'levelId', 'Invalid ID');
  check(Number.isInteger(input.revision) && Number(input.revision) > 0, 'revision', 'Invalid revision');
  check(['en', 'fr', 'es'].includes(String(input.locale)), 'locale', 'Missing or invalid locale');
  check(Number.isInteger(input.difficulty) && Number(input.difficulty) >= 1 && Number(input.difficulty) <= 5, 'difficulty', 'Expected difficulty 1–5');
  const cards = Array.isArray(input.cards) ? input.cards : [];
  const groups = Array.isArray(input.groups) ? input.groups : [];
  check(cards.length === 16, 'cards', 'Expected 16 cards');
  check(groups.length === 4, 'groups', 'Expected 4 groups');
  const cardIds = new Set<string>(); const labels = new Set<string>(); const groupIds = new Set<string>(); const assigned = new Map<string, number>();
  cards.forEach((c, i) => {
    if (!object(c)) { check(false, `cards.${i}`, 'Invalid card'); return; }
    check(id(c.id) && !cardIds.has(String(c.id)), `cards.${i}.id`, 'Invalid or duplicate ID'); cardIds.add(String(c.id));
    const normalized = typeof c.text === 'string' ? c.text.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase(['en', 'fr', 'es'].includes(String(input.locale)) ? String(input.locale) : 'en') : '';
    check(normalized && !labels.has(normalized), `cards.${i}.text`, 'Empty or duplicate visible card'); labels.add(normalized);
  });
  groups.forEach((g, i) => {
    if (!object(g)) { check(false, `groups.${i}`, 'Invalid group'); return; }
    check(id(g.id) && !groupIds.has(String(g.id)), `groups.${i}.id`, 'Invalid or duplicate ID'); groupIds.add(String(g.id));
    check(text(g.label), `groups.${i}.label`, 'Missing label');
    const refs = Array.isArray(g.cardIds) ? g.cardIds : [];
    check(refs.length === 4 && new Set(refs).size === 4, `groups.${i}.cardIds`, 'Expected four distinct cards');
    refs.forEach(ref => { check(cardIds.has(ref), `groups.${i}.cardIds`, 'Unknown card'); assigned.set(ref, (assigned.get(ref) ?? 0) + 1); });
  });
  cardIds.forEach(ref => check(assigned.get(ref) === 1, 'groups', `Card ${ref} must belong to exactly one group`));
  check(Array.isArray(input.hints), 'hints', 'Expected hints array');
  const hintIds = new Set<string>();
  (Array.isArray(input.hints) ? input.hints : []).forEach((h, i) => {
    if (!object(h)) { check(false, `hints.${i}`, 'Invalid hint'); return; }
    check(id(h.id) && !hintIds.has(String(h.id)), `hints.${i}.id`, 'Invalid or duplicate ID'); hintIds.add(String(h.id));
    const group = groups.find(g => object(g) && g.id === h.groupId);
    check(!!group, `hints.${i}.groupId`, 'Unknown group');
    if (h.kind === 'pair') check(Array.isArray(h.cardIds) && h.cardIds.length === 2 && new Set(h.cardIds).size === 2 && h.cardIds.every(c => (Array.isArray(group?.cardIds) && group.cardIds.includes(c))), `hints.${i}`, 'Pair must contain two members of its group');
    else if (h.kind === 'category') check(text(h.text), `hints.${i}.text`, 'Missing clue');
    else check(false, `hints.${i}.kind`, 'Unsupported hint');
  });
  const l = input.localization;
  check(object(l) && (l.kind === 'original' || (['translated-equivalent', 'adapted-equivalent'].includes(String(l.kind)) && id(l.sourceLevelId) && Number.isInteger(l.sourceRevision) && Number(l.sourceRevision) > 0)), 'localization', 'Invalid source metadata');
  const r = input.review;
  check(object(r) && ['draft', 'approved'].includes(String(r.status)), 'review', 'Missing review status');
  if (object(r) && r.status === 'approved') check(r.reviewedRevision === input.revision && text(r.reviewer), 'review', 'Approval must match revision and name reviewer');
  return issues;
}
export function parsePuzzle(input: unknown): Puzzle {
  const issues = validatePuzzle(input);
  if (issues.length) throw new Error(issues.map(i => `${i.path}: ${i.message}`).join('\n'));
  return input as Puzzle;
}
export function validateCatalog(input: unknown, production = false): Issue[] {
  if (!Array.isArray(input) || !input.every(p => object(p) && id(p.packId) && ['en', 'fr', 'es'].includes(String(p.locale)) && ['normal', 'daily'].includes(String(p.purpose)) && Array.isArray(p.entries) && p.entries.every(e => object(e) && id(e.levelId)) && Array.isArray(p.puzzles))) return [{ path: '', message: 'Malformed pack catalog' }];
  const shapeIssues = input.flatMap(p => p.puzzles.flatMap((puzzle: unknown) => validatePuzzle(puzzle)));
  if (shapeIssues.length) return shapeIssues;
  const packs = input as Pack[];
  const issues: Issue[] = []; const all = packs.flatMap(p => p.puzzles); const ids = new Set<string>(); const packIds = new Set<string>();
  for (const pack of packs) {
    if (packIds.has(pack.packId)) issues.push({ path: pack.packId, message: 'Duplicate pack ID' }); packIds.add(pack.packId);
    const positions = new Set<number>(); const entries = new Set<string>();
    for (const puzzle of pack.puzzles) {
      issues.push(...validatePuzzle(puzzle).map(i => ({ ...i, path: `${puzzle.levelId}.${i.path}` })));
      if (ids.has(puzzle.levelId) || puzzle.locale !== pack.locale) issues.push({ path: puzzle.levelId, message: 'Duplicate ID or locale mismatch' }); ids.add(puzzle.levelId);
      if (production && puzzle.review.status !== 'approved') issues.push({ path: puzzle.levelId, message: 'Editorial approval required' });
      const visited = new Set<string>([puzzle.levelId]); let current = puzzle;
      while (current.localization.kind !== 'original') {
        const link = current.localization; const source = all.find(p => p.levelId === link.sourceLevelId);
        if (!source || source.revision !== link.sourceRevision || visited.has(source.levelId)) { issues.push({ path: puzzle.levelId, message: 'Missing, stale or cyclic source reference' }); break; }
        visited.add(source.levelId); current = source;
      }
    }
    for (const entry of pack.entries) {
      const puzzle = pack.puzzles.find(p => p.levelId === entry.levelId);
      if (!puzzle || entries.has(entry.levelId)) issues.push({ path: pack.packId, message: 'Missing or duplicate entry' }); entries.add(entry.levelId);
      if (pack.purpose === 'normal') {
        const n = entry.number ?? 0;
        if (!Number.isInteger(n) || n < 1 || positions.has(n)) issues.push({ path: pack.packId, message: 'Invalid level position' }); positions.add(n);
        if (production && puzzle?.difficulty !== Math.ceil(n / 20)) issues.push({ path: entry.levelId, message: 'Difficulty progression mismatch' });
      }
    }
    if (pack.purpose === 'normal' && ([...positions].some(n => n > positions.size) || (production && positions.size !== 100))) issues.push({ path: pack.packId, message: 'Expected contiguous level positions (100 for release)' });
  }
  for (const locale of ['fr', 'en', 'es']) for (const purpose of ['normal', 'daily']) if (!packs.some(p => p.locale === locale && p.purpose === purpose)) issues.push({ path: locale, message: `Missing ${purpose} pack` });
  return issues;
}
