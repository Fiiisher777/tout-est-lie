import source from '../../nodi-brand-lore-content-pack-v1.json';
import type { Locale } from '../game/content/schema';
import { environment, type Environment } from '../config/environment';
export type ReactionKind = keyof typeof source.gameplayReactions;
export type CardType = 'mot_retrouve' | 'etymologie' | 'curiosite_linguistique' | 'note_professeur' | 'observation_nodi';
export type LoreCard = {
  id: string; locale: Locale; type: CardType; title: string; body: string; professorNote: string | null;
  factCheckRequired: boolean; status: 'draft' | 'approved';
  review?: { reviewer: string; reviewedAt: string; factChecked: boolean; approvedText: string };
};
export type LoreFragment = LoreCard & { unlockPosition?: number };
export type Zone = { id: string; first: number; last: number; name: string; purpose: string; entryLine: string; visualSeeds: readonly string[] };
export const brand = {
  publicName: source.brand.publicName, machineName: source.brand.machineName,
  machineExpansion: source.brand.machineExpansion, taglineFr: source.brand.taglineFr,
  centralBelief: source.brand.centralBelief,
};
// Writer-facing only. Screens never receive the premise, final beat or mystery rules.
export const writerGuide = { professor: source.professor, brand: source.brand, editorialRules: source.editorialRules, contentSafety: source.contentSafety, level100Beat: source.level100Beat };
const cardTypes: CardType[] = ['mot_retrouve','etymologie','curiosite_linguistique','note_professeur','observation_nodi'];
export const openingCards: readonly LoreCard[] = source.openingCards.map(card => {
  if (!cardTypes.includes(card.type as CardType) || card.status !== 'draft') throw new Error('Unexpected lore source shape/status');
  return { ...card, locale: 'fr', type: card.type as CardType, status: 'draft' };
});
export const zones: readonly Zone[] = source.zones.map(zone => {
  const [first, last] = zone.levels.split('–').map(Number);
  if (!Number.isInteger(first) || !Number.isInteger(last)) throw new Error('Invalid lore zone range');
  return { ...zone, id: `zone-${first}`, first, last };
});
export const loreFragments: readonly LoreFragment[] = []; // Future authored fragments, same editorial gate.
export const ritual = source.openingRitual;
export const dailyLore = source.daily;
export const loreUiFr = {
  saved: 'Conservé dans le carnet', remove: 'Retirer du carnet', close: 'Fermer le carnet',
  empty: 'Aucune fiche conservée pour le moment.', error: 'Le carnet est momentanément indisponible.', retry: 'Réessayer',
  categories: { mot_retrouve: 'Mot retrouvé', etymologie: 'Étymologie', curiosite_linguistique: 'Curiosité linguistique', note_professeur: 'Note du Professeur', observation_nodi: 'Observation de N.O.D.I.' },
};
export function cardReviewText(card: LoreCard) {
  return JSON.stringify([card.locale,card.type,card.title,card.body,card.professorNote,card.factCheckRequired]);
}
export function approvedCard(card: LoreCard) {
  const review = card.review;
  return card.status === 'approved' && !!review?.reviewer.trim() && Number.isFinite(Date.parse(review.reviewedAt)) && review.approvedText === cardReviewText(card) && (!card.factCheckRequired || review.factChecked === true);
}
export function eligibleCards(locale: Locale, mode: Environment = environment, cards = openingCards): LoreCard[] {
  return cards.filter(card => card.locale === locale && (approvedCard(card) || (mode !== 'production' && card.status === 'draft' && !card.factCheckRequired && ['note_professeur','observation_nodi'].includes(card.type))));
}
export function prototypeLoreAvailable(locale: Locale, mode: Environment = environment) { return locale === 'fr' && mode !== 'production'; }
export function zoneForLevel(level: number): Zone | undefined { return zones.find(z => level >= z.first && level <= z.last); }
export function currentZone(highestUnlocked: number, highestAvailable = 100) { return zoneForLevel(Math.min(highestUnlocked, highestAvailable, 100)); }
export function hash(text: string) { let n=2166136261; for(const char of text) n=Math.imul(n^char.charCodeAt(0),16777619); return n>>>0; }
export function reaction(kind: ReactionKind, locale: Locale, seed: string, mode: Environment = environment): string | undefined {
  if (!prototypeLoreAvailable(locale, mode)) return undefined;
  const lines = source.gameplayReactions[kind]; return lines[hash(seed)%lines.length];
}
