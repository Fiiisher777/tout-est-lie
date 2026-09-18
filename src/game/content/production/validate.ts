import { validatePuzzle, type Issue } from '../validate';
import { approvalContent, approvalCurrent, validReviewDate, locales, statuses, type ProductionPuzzle, type ReleasedRevision } from './schema';
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown): x is string => typeof x === 'string' && !!x.trim();
const id = (x: unknown) => text(x) && /^[a-zA-Z0-9_-]+$/.test(x) && !['__proto__', 'constructor', 'prototype'].includes(x);
export function validateProductionPuzzle(input: unknown): Issue[] {
  if (!object(input)) return [{ path: '', message: 'Expected production puzzle object' }];
  // Reuse the engine validator without conflating its legacy fixture review
  // fields with production editorial approval.
  const issues = validatePuzzle({ ...input, localization: { kind: 'original' }, review: { status: 'draft' } });
  const check = (ok: unknown, path: string, message: string) => { if (!ok) issues.push({ path, message }); };
  check(Number.isInteger(input.position) && Number(input.position) >= 1 && Number(input.position) <= 100, 'position', 'Expected level position 1–100');
  check(statuses.includes(input.status as never), 'status', 'Invalid editorial status');
  for (const field of ['rationale', 'intendedReason', 'ambiguityNotes']) check(text(input[field]), field, 'Required editorial text (write “none identified” only after considering ambiguity)');
  check(Array.isArray(input.knownDecoys) && input.knownDecoys.every(text), 'knownDecoys', 'Expected array of decoy descriptions; empty is allowed');
  for (const [i, group] of (Array.isArray(input.groups) ? input.groups : []).entries()) {
    check(object(group) && text(group.explanation) && text(group.intendedReason), `groups.${i}`, 'Each group needs explanation and intendedReason');
  }
  const hints = Array.isArray(input.hints) ? input.hints : [];
  for (const kind of ['pair', 'category']) check(hints.some(h => object(h) && h.kind === kind), 'hints', `At least one ${kind.toUpperCase()} hint required`);
  const c = input.concept;
  check(object(c) && id(c.id) && ['original', 'direct-equivalent', 'adapted-equivalent', 'locale-replacement'].includes(String(c.relationship)), 'concept', 'Invalid concept ID or relationship');
  if (object(c)) {
    if (c.relationship === 'original') check(c.source === undefined, 'concept.source', 'Original concept must not reference a source');
    else check(object(c.source) && id(c.source.puzzleId) && Number.isInteger(c.source.revision) && Number(c.source.revision) > 0, 'concept.source', 'Relationship needs source puzzle ID and revision');
  }
  if (input.review !== undefined) {
    const r = input.review;
    check(object(r) && text(r.reviewedBy) && validReviewDate(r.reviewedAt) && Number.isInteger(r.approvedRevision) && Number(r.approvedRevision) > 0 && text(r.approvedContent), 'review', 'Review requires reviewer, ISO timestamp, positive approvedRevision and approvedContent');
  }
  if (input.status === 'approved' && !issues.length) check(approvalCurrent(input as ProductionPuzzle), 'review', 'Missing or stale explicit approval: re-review current content and revision');
  if (input.status === 'rejected') check(text(input.rejectionReason), 'rejectionReason', 'Rejected content requires a reason');
  return issues;
}
export function validateProduction(input: unknown, released: readonly ReleasedRevision[] = []): Issue[] {
  if (!Array.isArray(input)) return [{ path: '', message: 'Expected array of production puzzles' }];
  const issues: Issue[] = [];
  if (!Array.isArray(released) || released.some(r => !object(r) || !id(r.puzzleId) || !Number.isInteger(r.revision) || Number(r.revision) < 1 || !text(r.content)) || new Set(released.map(r => r.puzzleId)).size !== released.length) {
    return [{ path: 'released', message: 'Malformed or duplicate release baseline records' }];
  }
  const ids = new Map<string, number>(); const positions = new Map<string, number>();
  input.forEach((p, index) => {
    const prefix = object(p) && text(p.levelId) ? p.levelId : `item-${index}`;
    issues.push(...validateProductionPuzzle(p).map(i => ({ ...i, path: `${prefix}.${i.path}` })));
    if (!object(p)) return;
    if (text(p.levelId)) ids.set(p.levelId, (ids.get(p.levelId) ?? 0) + 1);
    const position = `${p.locale}:${p.position}`; positions.set(position, (positions.get(position) ?? 0) + 1);
    if (Number.isInteger(p.position) && p.difficulty !== Math.ceil(Number(p.position) / 20)) issues.push({ path: `${prefix}.difficulty`, message: 'Incorrect difficulty for position' });
  });
  for (const [key, count] of ids) if (count > 1) issues.push({ path: key, message: 'Duplicate puzzle ID' });
  for (const [key, count] of positions) if (count > 1) issues.push({ path: key, message: 'Duplicate level position' });
  for (const p of input) {
    if (!object(p) || !object(p.concept)) continue;
    const visited = new Set<unknown>([p.levelId]); let current = p;
    while (object(current.concept) && current.concept.relationship !== 'original') {
      const link = current.concept.source;
      const source = object(link) ? input.find(s => object(s) && s.levelId === link.puzzleId) : undefined;
      if (!object(source) || validateProductionPuzzle(source).length > 0 || input.filter(s => object(s) && s.levelId === source.levelId).length !== 1 || !object(link) || source.revision !== link.revision || !object(source.concept) || source.concept.id !== current.concept.id || source.locale === current.locale || visited.has(source.levelId)) {
        issues.push({ path: `${p.levelId}.concept`, message: 'Broken equivalence: missing/stale source, different concept, same locale or cycle' }); break;
      }
      visited.add(source.levelId); current = source;
    }
  }
  const roots = input.filter(p => object(p) && object(p.concept) && p.concept.relationship === 'original');
  for (const p of roots) if (roots.filter(r => r.concept.id === p.concept.id).length > 1) issues.push({ path: `${p.levelId}.concept`, message: 'Concept has multiple original roots' });
  for (const prior of released) {
    const p = input.find(p => object(p) && p.levelId === prior.puzzleId);
    if (!p || !object(p) || Number(p.revision) < prior.revision || (p.revision === prior.revision && approvalContent(p as ProductionPuzzle) !== prior.content)) issues.push({ path: prior.puzzleId, message: 'Released puzzle removed, revision regressed, or published revision edited; increment revision' });
  }
  return issues;
}
export function releaseCheck(input: unknown, released: readonly ReleasedRevision[] = []): Issue[] {
  const issues = validateProduction(input, released);
  const puzzles = Array.isArray(input) ? input.filter(object) : [];
  for (const locale of locales) {
    const local = puzzles.filter(p => p.locale === locale);
    if (!local.length) issues.push({ path: locale, message: 'Missing locale coverage' });
    for (let position = 1; position <= 100; position++) {
      if (!local.some(p => p.position === position)) issues.push({ path: `${locale}:${position}`, message: 'Missing level position' });
    }
  }
  for (const p of puzzles) if (validateProductionPuzzle(p).length || !approvalCurrent(p as ProductionPuzzle)) issues.push({ path: String(p.levelId), message: 'Unapproved puzzle: explicit current editorial approval required' });
  return issues;
}
// Validation never changes status. Only an explicit approval action calls this.
export function approvePuzzle(p: ProductionPuzzle, reviewedBy: string, reviewedAt: string): ProductionPuzzle {
  if (p.status !== 'editorial_review') throw new Error('Move puzzle to editorial_review before approving');
  if (validateProductionPuzzle(p).length) throw new Error('Fix structural errors before approving');
  const approved: ProductionPuzzle = { ...p, status: 'approved', review: { reviewedBy, reviewedAt, approvedRevision: p.revision, approvedContent: approvalContent(p) } };
  if (validateProductionPuzzle(approved).length) throw new Error('Valid reviewer name and ISO timestamp required');
  return approved;
}

export function importDrafts(existing: unknown, batch: unknown, released: readonly ReleasedRevision[] = []): ProductionPuzzle[] {
  if (!Array.isArray(existing) || !Array.isArray(batch)) throw new Error('Catalog and batch must be JSON arrays');
  const drafts = batch.map(p => {
    if (!object(p)) throw new Error('Each batch record must be an object');
    const { review: _review, rejectionReason: _rejection, ...content } = p;
    return { ...content, status: 'draft' };
  });
  const combined = [...existing, ...drafts];
  const issues = validateProduction(combined, released);
  if (issues.length) throw new Error(issues.map(i => `${i.path}: ${i.message}`).join('\n'));
  return combined as ProductionPuzzle[];
}
