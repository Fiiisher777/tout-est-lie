export type Locale = 'fr' | 'en' | 'es';
export type Hint = { id: string; groupId: string } & (
  | { kind: 'pair'; cardIds: [string, string] }
  | { kind: 'category'; text: string }
);
export type Puzzle = {
  schemaVersion: 1; levelId: string; revision: number; locale: Locale;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cards: { id: string; text: string }[];
  groups: { id: string; label: string; cardIds: string[]; explanation?: string; intendedReason?: string }[];
  hints: Hint[];
  localization: { kind: 'original' } | { kind: 'translated-equivalent' | 'adapted-equivalent'; sourceLevelId: string; sourceRevision: number };
  editorial?: { intendedReason?: string; knownDecoys?: string[]; ambiguityNotes?: string };
  review: { status: 'draft' | 'approved'; reviewedRevision?: number; reviewer?: string };
};
export type Pack = { packId: string; locale: Locale; purpose: 'normal' | 'daily'; entries: { levelId: string; number?: number }[]; puzzles: Puzzle[] };
