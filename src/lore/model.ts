import { currentZone, hash, type LoreCard, type Zone } from './content';
export const loreConfig = { meaningfulAbsenceMs: 48 * 60 * 60 * 1000, wrongReactionEvery: 3, wrongReactionCooldownMs: 30000, reactionDisplayMs: 3500 } as const;
export type LoreState = { version: 1; lastShownLocalDate: string | null; lastOpeningCardId: string | null; savedLoreCardIds: string[]; seenZoneEntryIds: string[]; lastSeenAt: number | null };
export function initialLore(): LoreState { return { version: 1, lastShownLocalDate: null, lastOpeningCardId: null, savedLoreCardIds: [], seenZoneEntryIds: [], lastSeenAt: null }; }
export function localDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function decodeLore(raw: string | null): LoreState {
  if (raw === null) return initialLore();
  const data = JSON.parse(raw);
  if (!data || data.version !== 1) throw new Error('Unsupported or invalid lore save');
  const ids = (value: unknown): value is string[] => Array.isArray(value) && value.every(id => typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id));
  if (!ids(data.savedLoreCardIds) || !ids(data.seenZoneEntryIds) || (data.lastShownLocalDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(data.lastShownLocalDate)) || (data.lastOpeningCardId !== null && typeof data.lastOpeningCardId !== 'string') || (data.lastSeenAt !== null && (!Number.isFinite(data.lastSeenAt) || data.lastSeenAt < 0))) throw new Error('Invalid lore save');
  return { ...data, savedLoreCardIds: [...new Set(data.savedLoreCardIds)] as string[], seenZoneEntryIds: [...new Set(data.seenZoneEntryIds)] as string[] };
}
export function saveCard(state: LoreState, id: string, saved: boolean): LoreState { return { ...state, savedLoreCardIds: saved ? [...new Set([...state.savedLoreCardIds,id])] : state.savedLoreCardIds.filter(value=>value!==id) }; }
export function openingVisit(state: LoreState, date: Date, cards: readonly LoreCard[]) {
  const today = localDate(date); const now = date.getTime();
  const returned = state.lastSeenAt !== null && now - state.lastSeenAt >= loreConfig.meaningfulAbsenceMs;
  let next = { ...state, lastSeenAt: Math.max(state.lastSeenAt ?? 0,now) };
  // Clock/timezone rollback must not replay a previously shown day.
  if (!cards.length || (state.lastShownLocalDate !== null && state.lastShownLocalDate >= today)) return { state: next, returned, card: undefined };
  const pool = cards.length > 1 ? cards.filter(c=>c.id!==state.lastOpeningCardId) : cards;
  const card = pool[hash(today)%pool.length];
  next = { ...next, lastShownLocalDate: today, lastOpeningCardId: card.id };
  return { state: next, returned, card };
}
export function claimZone(state: LoreState, highestUnlocked: number, highestAvailable: number, zones: readonly Zone[]) {
  const zone = currentZone(highestUnlocked, highestAvailable);
  if (!zone || state.seenZoneEntryIds.includes(zone.id)) return { state, zone: undefined };
  // Migrated testers get only their current entry, never a backlog of earlier intros.
  return { state: { ...state, seenZoneEntryIds: [...new Set([...state.seenZoneEntryIds,...zones.filter(z=>z.first<=zone.first).map(z=>z.id)])] }, zone };
}
