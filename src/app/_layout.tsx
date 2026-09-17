import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, AppState } from 'react-native';
import { PlayerProvider, usePlayer } from '../state/PlayerProvider';
import { useTranslation } from '../i18n';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { theme } from '../config/theme';
import { audio } from '../services/audio';
export { ErrorBoundary } from 'expo-router';
void SplashScreen.preventAutoHideAsync().catch(() => {});
function Navigation() {
  const { ready } = usePlayer(); const { t } = useTranslation();
  useEffect(() => { if (ready) void SplashScreen.hideAsync().catch(() => {}); }, [ready]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', status => { if (status !== 'active') audio.stop(); });
    return () => listener.remove();
  }, []);
  if (!ready) return <Screen><ActivityIndicator /><AppText>{t('loading')}</AppText></Screen>;
  return <>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ title: t('home') }} />
      <Stack.Screen name="levels" options={{ title: t('levels') }} />
      <Stack.Screen name="game" options={{ title: t('game') }} />
      <Stack.Screen name="results" options={{ title: t('results'), gestureEnabled: false }} />
      <Stack.Screen name="settings" options={{ title: t('settings') }} />
      <Stack.Screen name="daily" options={{ title: t('daily') }} />
      <Stack.Screen name="+not-found" options={{ title: t('notFound') }} />
    </Stack>
  </>;
}
export default function RootLayout() { return <PlayerProvider><Navigation /></PlayerProvider>; }
