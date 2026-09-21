import type { ImageRequireSource } from 'react-native';
import { levelsFor } from '../game/content';
import { canStartLevel, type Progression } from '../state/progression';
import type { Locale } from '../game/content/schema';
import { currentZone } from '../lore/content';

// Approved static local assets. Slots remain nullable for fallback testing.
export const homeAssets: { logo: ImageRequireSource | null; libraryBackground: ImageRequireSource | null; professorIllustration: ImageRequireSource | null } = {
  logo: require('../../assets/home/nodi-logo.png'),
  libraryBackground: require('../../assets/home/library-background.png'),
  professorIllustration: require('../../assets/home/professor.png'),
};
export function homeCampaign(state: {highestUnlockedLevel: Progression; completedLevels: readonly string[]}, locale: Locale) {
  const levels = levelsFor(locale);
  const level = levels.filter(l => canStartLevel(state, locale, l.id)).sort((a,b)=>b.number-a.number)[0];
  const highestAvailable = Math.max(0,...levels.map(l=>l.number));
  return { level, zone: currentZone(state.highestUnlockedLevel[locale], highestAvailable),
    complete: !!level && level.number === highestAvailable && state.completedLevels.includes(level.id) };
}
export const homeCopy = {
  fr: { level: 'Niveau', complete: 'Vous avez parcouru tous les niveaux disponibles.', replay: 'Rejouer', notebook: 'Carnet', unavailable: 'Bientôt disponible' },
  en: { level: 'Level', complete: 'You have completed all available levels.', replay: 'Replay', notebook: 'Notebook', unavailable: 'Coming soon' },
  es: { level: 'Nivel', complete: 'Has completado todos los niveles disponibles.', replay: 'Volver a jugar', notebook: 'Cuaderno', unavailable: 'Próximamente' },
} as const;
