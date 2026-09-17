import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Tiny Game Starter', slug: 'tiny-game-starter', version: '1.0.0',
  orientation: 'portrait', scheme: 'tinygamestarter', userInterfaceStyle: 'light',
  platforms: ['ios', 'android'],
  // Assign unique bundleIdentifier / package values when duplicating this starter.
  ios: { supportsTablet: false },
  android: { predictiveBackGestureEnabled: true },
  plugins: ['expo-router', 'expo-dev-client',
    ['expo-splash-screen', { backgroundColor: '#F8FAFC' }],
    ['expo-localization', { supportedLocales: ['en', 'fr', 'es'] }]],
  experiments: { typedRoutes: true, reactCompiler: true },
};
export default config;
