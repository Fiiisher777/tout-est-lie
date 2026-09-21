import type { Puzzle } from '../schema';
export const locales = ['fr', 'en', 'es'] as const;
export const statuses = ['draft', 'structurally_valid', 'editorial_review', 'approved', 'rejected'] as const;
export type EditorialStatus = typeof statuses[number];
export type ProductionPuzzle = Omit<Puzzle, 'localization' | 'review' | 'editorial'> & {
  position: number;
  concept: {
    id: string;
    relationship: 'original' | 'direct-equivalent' | 'adapted-equivalent' | 'locale-replacement';
    source?: { puzzleId: string; revision: number };
  };
  // Author-only import metadata; never projected into the gameplay UI.
  editorialNotes?: string;
  provenance?: { sourceFile: string; sourceCandidate: number };
  rationale: string;
  intendedReason: string;
  knownDecoys: string[];
  ambiguityNotes: string;
  status: EditorialStatus;
  review?: {
    reviewedBy: string;
    reviewedAt: string;
    approvedRevision: number;
    // Canonical content at the moment of explicit approval. This also catches
    // edits where an author forgets to increment the revision.
    approvedContent: string;
  };
  rejectionReason?: string;
};
export type ReleasedRevision = { puzzleId: string; revision: number; content: string };
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}
export function approvalContent(p: ProductionPuzzle): string {
  const { status: _status, review: _review, rejectionReason: _rejection, ...content } = p;
  return canonical(content);
}
export function validReviewDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
export function approvalCurrent(p: ProductionPuzzle): boolean {
  return p.status === 'approved' && typeof p.review?.reviewedBy === 'string' && !!p.review.reviewedBy.trim() && validReviewDate(p.review.reviewedAt) && p.review.approvedRevision === p.revision && p.review.approvedContent === approvalContent(p);
}
export function toEnginePuzzle(p: ProductionPuzzle): Puzzle {
  return {
    schemaVersion: p.schemaVersion, levelId: p.levelId, revision: p.revision,
    locale: p.locale, difficulty: p.difficulty, cards: p.cards, groups: p.groups, hints: p.hints,
    localization: { kind: 'original' },
    editorial: { intendedReason: p.intendedReason, knownDecoys: p.knownDecoys, ambiguityNotes: p.ambiguityNotes },
    review: approvalCurrent(p) ? { status: 'approved', reviewedRevision: p.revision, reviewer: p.review!.reviewedBy } : { status: 'draft' },
  };
}
