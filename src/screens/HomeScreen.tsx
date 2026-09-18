import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { hasDailyContent, levelsFor } from '../game/content';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function HomeScreen() {
  const router = useRouter(); const { t, locale } = useTranslation(); const { state, writable } = usePlayer();
  const levels = levelsFor(locale);
  const next = levels.find(level => !state.completedLevels.includes(level.id)) ?? levels[0];
  return <Screen title={t('productName')}>
    <AppText variant="muted">{t('tagline')}</AppText>
    <AppText variant="muted">{t('progress', { count: levels.filter(level => state.completedLevels.includes(level.id)).length, total: levels.length })}</AppText>
    <Button title={t(state.completedLevels.length ? 'continue' : 'play')} disabled={!writable || !next} onPress={() => router.push({ pathname: '/game', params: { mode: 'level', levelId: next.id } })} />
    <Button secondary title={t('levels')} onPress={() => router.push('/levels')} />
    <Button secondary title={t('daily')} disabled={!hasDailyContent(locale)} onPress={() => router.push('/daily')} />
    {__DEV__ && <Button secondary title="Draft Preview" onPress={() => router.push('/draft-preview')} />}
    <Button secondary title={t('settings')} onPress={() => router.push('/settings')} />
  </Screen>;
}
