import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { levels } from '../game/content';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function ResultsScreen() {
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const router = useRouter(); const { t } = useTranslation(); const { state, writable } = usePlayer();
  const result = state.lastResult?.id === resultId ? state.lastResult : null;
  const index = levels.findIndex(level => level.id === result?.levelId);
  const next = index >= 0 ? levels[index + 1] : undefined;
  return <Screen title={t('results')}>
    {!result ? <AppText>{t('noResult')}</AppText> : <>
      <AppText variant="subtitle">{t('completed')}</AppText>
      <AppText>{t('score', { score: result.score })}</AppText>
      {result.mode === 'daily' && <AppText>{t('dailyDate', { date: result.date })}</AppText>}
      <Button title={t('replay')} disabled={!writable} onPress={() => router.replace({ pathname: '/game', params: result.mode === 'daily' ? { mode: result.mode, levelId: result.levelId, date: result.date } : { mode: result.mode, levelId: result.levelId } })} />
      {result.mode === 'level' && next && <Button title={t('next')} disabled={!writable} onPress={() => router.replace({ pathname: '/game', params: { mode: 'level', levelId: next.id } })} />}
    </>}
    <Button secondary title={t('backHome')} onPress={() => router.dismissTo('/')} />
  </Screen>;
}
