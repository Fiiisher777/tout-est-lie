import catalog from '../../content/production/puzzles.json';
import { levelsFor } from '../game/content';
import type { Locale } from '../game/content/schema';
export type Progression = Record<Locale, number>;
const locales: Locale[] = ['fr', 'en', 'es'];
// Authoring metadata identifies historical IDs even when their content is not playable.
// This never grants access: launch guards also require the current runtime catalog.
export function levelPosition(id: string, locale: Locale): number | undefined {
  return levelsFor(locale).find(p => p.id === id)?.number ?? catalog.find(p => p.levelId === id && p.locale === locale)?.position;
}
export function deriveProgression(completed: readonly string[], previous?: Partial<Progression>): Progression {
  return Object.fromEntries(locales.map(locale => [locale, Math.max(
    Number.isSafeInteger(previous?.[locale]) && previous![locale]! >= 1 ? previous![locale]! : 1,
    ...completed.map(id => (levelPosition(id, locale) ?? 0) + 1),
  )])) as Progression;
}
export function canStartLevel(state: { highestUnlockedLevel: Progression }, locale: Locale, id: string): boolean {
  const level = levelsFor(locale).find(p => p.id === id);
  return !!level && level.number <= state.highestUnlockedLevel[locale];
}
export function nextUnlockedLevel(state: { highestUnlockedLevel: Progression }, locale: Locale, id: string) {
  const current = levelsFor(locale).find(p => p.id === id);
  return current ? levelsFor(locale).find(p => p.number === current.number + 1 && canStartLevel(state, locale, p.id)) : undefined;
}
