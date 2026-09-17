import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { findLevel } from '../game/content';
import { GameView } from '../game/GameView';
import type { GameLaunch, GameResult } from '../game/types';
import { dailyChallenge, isUtcDate } from '../daily/challenge';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
import { analytics } from '../services/analytics';
import { hapticFeedback } from '../services/haptics';
import { audio } from '../services/audio';

export function GameScreen() {
  const params = useLocalSearchParams<{ mode?: string; levelId?: string; date?: string }>();
  const router = useRouter(); const { t } = useTranslation(); const { state, update, writable } = usePlayer();
  const pending = useRef<GameResult | null>(null); const busy = useRef(false);
  const level = typeof params.levelId === 'string' ? findLevel(params.levelId) : undefined;
  let launch: GameLaunch | null = null;
  if (level && params.mode === 'level') launch = { mode: 'level', levelId: level.id };
  if (level && params.mode === 'daily' && isUtcDate(params.date)) {
    const challenge = dailyChallenge(new Date(params.date + 'T00:00:00Z'));
    if (challenge.levelId === level.id) launch = challenge;
  }
  const launchKey = launch ? JSON.stringify(launch) : null;
  useEffect(() => {
    pending.current = null;
    if (launchKey) { const started = JSON.parse(launchKey) as GameLaunch; analytics.track({ name: 'game_started', mode: started.mode, levelId: started.levelId }); }
    return () => audio.stop();
  }, [launchKey]);
  async function complete(score: number) {
    if (!launch || busy.current || !writable) return;
    busy.current = true;
    try {
      if (!Number.isFinite(score) || score < 0) throw new Error('Invalid score');
      pending.current ??= { ...launch, id: `result-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, score, completedAt: new Date().toISOString() };
      const result = pending.current;
      await update({ type: 'complete', result });
      analytics.track({ name: 'game_completed', mode: result.mode, levelId: result.levelId, score: result.score });
      void hapticFeedback(state.preferences.haptics, 'complete');
      void audio.play('complete', state.preferences.sound).catch(() => {});
      router.replace({ pathname: '/results', params: { resultId: result.id } });
    } catch { Alert.alert(t('saveFailed'), t('saveFailedBody')); }
    finally { busy.current = false; }
  }
  if (!launch || !level) return <Screen><AppText>{t('invalidGame')}</AppText><Button title={t('backHome')} onPress={() => router.replace('/')} /></Screen>;
  return <Screen title={t('level', { number: level.number })}>
    {launch.mode === 'daily' && <AppText variant="muted">{t('dailyDate', { date: launch.date })}</AppText>}
    {writable && <GameView key={launchKey} launch={launch} onComplete={complete} />}
  </Screen>;
}
