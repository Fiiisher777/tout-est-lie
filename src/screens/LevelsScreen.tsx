import { LifeIndicator } from '../components/LifeIndicator';
import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { LevelCard } from '../components/LevelCard';
import { levelsFor } from '../game/content';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function LevelsScreen() {
  const router = useRouter(); const { t, locale } = useTranslation(); const { state, writable } = usePlayer();
  const levels = levelsFor(locale);
  return <Screen title={t('levels')}>
    <LifeIndicator />
    {levels.map(level => <LevelCard key={level.id} number={level.number} completed={state.completedLevels.includes(level.id)} disabled={!writable}
      onPress={() => router.push({ pathname: '/game', params: { mode: 'level', levelId: level.id } })} />)}
  </Screen>;
}
