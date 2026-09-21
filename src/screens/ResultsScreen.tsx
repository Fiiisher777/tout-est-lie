import { ProfessorReaction, ZoneMoment } from '../lore/components';
import { nextUnlockedLevel } from '../state/progression';
import { analytics } from '../services/analytics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function ResultsScreen() {
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const router = useRouter(); const { t } = useTranslation(); const { state, writable } = usePlayer();
  const result = state.lastResult?.id === resultId ? state.lastResult : null;
  const next = result?.mode === 'level' && result.outcome === 'won' ? nextUnlockedLevel(state, result.locale, result.levelId) : undefined;
  return <Screen title={t('results')}>
    {!result ? <AppText>{t('noResult')}</AppText> : <>
      <AppText variant="subtitle">{t(result.outcome)}</AppText>
      {result.outcome === 'won' && <><ProfessorReaction kind="victory" seed={result.id} /><ZoneMoment /></>}
      {result.outcome === 'lost' && <ProfessorReaction kind="timeout" seed={result.id} />}
      <AppText>{t('resultStats', { mistakes: result.mistakes, hints: result.hintsUsed, seconds: Math.floor(result.elapsedMs / 1000) })}</AppText>
      {result.mode === 'daily' && <AppText>{t('dailyDate', { date: result.date })}</AppText>}
      {next && <Button title={t('next')} disabled={!writable} onPress={() => {
        analytics.track({ name: 'next_level_continued', fromLevelId: result.levelId, levelId: next.id, locale: result.locale });
        router.replace({ pathname: '/game', params: { mode: 'level', levelId: next.id } });
      }} />}
      <Button secondary={!!next} title={t('replay')} disabled={!writable} onPress={() => router.replace({ pathname: '/game', params: result.mode === 'daily' ? { mode: result.mode, levelId: result.levelId, date: result.date } : { mode: result.mode, levelId: result.levelId } })} />
      <Button secondary title={t('levels')} onPress={() => router.replace('/levels')} />
    </>}
    <Button secondary title={t('backHome')} onPress={() => router.dismissTo('/')} />
  </Screen>;
}
