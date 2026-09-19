import type { ExpoConfig } from 'expo/config';

const variant = process.env.APP_VARIANT;
if (variant && !['development', 'tester', 'production'].includes(variant)) throw new Error('Unknown APP_VARIANT');
if (process.env.EAS_BUILD_PROFILE === 'production' && variant === 'tester') throw new Error('Production profile cannot build tester mode');
const tester = variant === 'tester';

const config: ExpoConfig = {
  name: tester ? 'NODI Beta' : 'NODI', slug: 'tiny-game-starter', version: '1.0.0',
  orientation: 'portrait', scheme: tester ? 'noditester' : 'tinygamestarter', userInterfaceStyle: 'light',
  platforms: ['ios', 'android'],
  // Assign unique bundleIdentifier / package values when duplicating this starter.
  ios: { supportsTablet: false },
  android: { predictiveBackGestureEnabled: true, ...(tester ? { package: 'com.nodi.playtest.tester' } : {}) },
  extra: { appVariant: variant },
  plugins: ['expo-router', 'expo-dev-client',
    ['expo-splash-screen', { backgroundColor: '#F8FAFC' }],
    ['expo-localization', { supportedLocales: ['en', 'fr', 'es'] }]],
  experiments: { typedRoutes: true, reactCompiler: true },
};
export default config;
