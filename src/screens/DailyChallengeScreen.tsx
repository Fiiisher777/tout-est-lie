import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { dailyChallenge } from '../daily/challenge';
import { findLevel } from '../game/content';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function DailyChallengeScreen() {
  const [challenge, setChallenge] = useState(() => dailyChallenge());
  const router = useRouter(); const { t } = useTranslation(); const { state, writable } = usePlayer();
  useFocusEffect(useCallback(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      setChallenge(dailyChallenge());
      const now = new Date();
      const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      timer = setTimeout(refresh, midnight - now.getTime() + 50);
    };
    refresh();
    const listener = AppState.addEventListener('change', status => { if (status === 'active') refresh(); });
    return () => { clearTimeout(timer); listener.remove(); };
  }, []));
  const level = findLevel(challenge.levelId);
  return <Screen title={t('daily')}>
    <AppText>{t('dailyHelp')}</AppText>
    <AppText>{t('dailyDate', { date: challenge.date })}</AppText>
    <AppText variant="subtitle">{t('level', { number: level?.number ?? 1 })}</AppText>
    {state.dailyCompletions[challenge.date] && <AppText>{t('dailyDone')}</AppText>}
    <Button title={t('playDaily')} disabled={!writable} onPress={() => {
      const current = dailyChallenge();
      setChallenge(current);
      router.push({ pathname: '/game', params: current });
    }} />
  </Screen>;
}
