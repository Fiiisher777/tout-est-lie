import { canStartLevel } from '../state/progression';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Alert, View } from 'react-native';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { findPuzzle, findLevel, hasDailyContent } from '../game/content';
import { GameView } from '../game/GameView';
import type { GameLaunch, GameResult } from '../game/types';
import { dailyChallenge, isUtcDate } from '../daily/challenge';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
export function GameScreen() {
  const params = useLocalSearchParams<{ mode?: string; levelId?: string; date?: string }>();
  const router = useRouter(); const { t, locale } = useTranslation(); const { state, update, writable } = usePlayer();
  const busy = useRef(false);
  const puzzle = findPuzzle(params.levelId ?? '');
  let launch: GameLaunch | null = null;
  if (puzzle && puzzle.locale === locale) {
    if (params.mode === 'level' && findLevel(puzzle.levelId) && canStartLevel(state, locale, puzzle.levelId)) launch = { mode: 'level', levelId: puzzle.levelId, locale, puzzleRevision: puzzle.revision };
    if (params.mode === 'daily' && hasDailyContent(locale) && isUtcDate(params.date)) {
      const daily = dailyChallenge(new Date(params.date + 'T00:00:00Z'), locale);
      if (daily.levelId === puzzle.levelId) launch = daily;
    }
  }
  async function complete(result: GameResult) {
    if (busy.current || !writable) throw new Error('Save unavailable');
    busy.current = true;
    try {
      await update({ type: 'complete', result });
      router.replace({ pathname: '/results', params: { resultId: result.id } });
    } catch (error) { Alert.alert(t('saveFailed'), t('saveFailedBody')); throw error; }
    finally { busy.current = false; }
  }
  if (!launch) return <Screen><AppText>{t('invalidGame')}</AppText><Button title={t('backHome')} onPress={() => router.replace('/')} /></Screen>;
  if (!writable) return <Screen title={t('productName')}>{null}</Screen>;
  return <View style={{ flex: 1 }}>
    <Stack.Screen options={{ headerShown: false }} />
    {writable && <GameView key={JSON.stringify(launch)} launch={launch} onComplete={complete} />}
  </View>;
}
