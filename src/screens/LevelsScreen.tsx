import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { LevelCard } from '../components/LevelCard';
import { levels } from '../game/content';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function LevelsScreen() {
  const router = useRouter(); const { t } = useTranslation(); const { state, writable } = usePlayer();
  return <Screen title={t('levels')}>
    {levels.map(level => <LevelCard key={level.id} number={level.number} completed={state.completedLevels.includes(level.id)} best={state.bestResults[level.id]} disabled={!writable}
      onPress={() => router.push({ pathname: '/game', params: { mode: 'level', levelId: level.id } })} />)}
  </Screen>;
}
