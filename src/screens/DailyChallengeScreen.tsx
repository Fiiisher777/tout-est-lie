import { hasDailyContent } from '../game/content';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { dailyChallenge } from '../daily/challenge';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function DailyChallengeScreen() {
  const { t, locale } = useTranslation();
  return hasDailyContent(locale) ? <AvailableDailyChallengeScreen /> : <Screen title={t('daily')}><AppText>{t('contentUnavailable')}</AppText></Screen>;
}
function AvailableDailyChallengeScreen() {
  const { t, locale } = useTranslation();
  const [challenge, setChallenge] = useState(() => dailyChallenge(new Date(), locale));
  const router = useRouter(); const { state, writable } = usePlayer();
  useFocusEffect(useCallback(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      setChallenge(dailyChallenge(new Date(), locale));
      const now = new Date();
      const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      timer = setTimeout(refresh, midnight - now.getTime() + 50);
    };
    refresh();
    const listener = AppState.addEventListener('change', status => { if (status === 'active') refresh(); });
    return () => { clearTimeout(timer); listener.remove(); };
  }, [locale]));
  return <Screen title={t('daily')}>
    <AppText>{t('dailyHelp')}</AppText>
    <AppText>{t('dailyDate', { date: challenge.date })}</AppText>
    <AppText variant="muted">{t('developmentPack')}</AppText>
    {state.dailyCompletions[`${locale}:${challenge.date}`] && <AppText>{t('dailyDone')}</AppText>}
    <Button title={t('playDaily')} disabled={!writable} onPress={() => {
      const current = dailyChallenge(new Date(), locale);
      setChallenge(current);
      router.push({ pathname: '/game', params: current });
    }} />
  </Screen>;
}
