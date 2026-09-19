import { isTester } from '../config/environment';
import { Redirect } from 'expo-router';
export default function DraftPreviewRoute() {
  if (!__DEV__ || isTester) return <Redirect href="/" />;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro can remove the development-only screen from release bundles.
  const { DraftPreviewScreen } = require('../screens/DraftPreviewScreen') as typeof import('../screens/DraftPreviewScreen');
  return <DraftPreviewScreen />;
}
