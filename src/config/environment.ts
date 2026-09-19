import Constants from 'expo-constants';
export type Environment = 'development' | 'tester' | 'production';
// Embedded by app.config.ts, not inferred from NODE_ENV or release optimization.
export function resolveEnvironment(variant: unknown, development: boolean): Environment {
  if (variant === 'tester') return 'tester';
  if (variant === 'production') return 'production';
  if (variant === undefined || variant === 'development') return development ? 'development' : 'production';
  return 'production';
}
export const environment = resolveEnvironment(Constants.expoConfig?.extra?.appVariant, __DEV__);
export const isTester = environment === 'tester';
export const playtestEnabled = environment !== 'production';
