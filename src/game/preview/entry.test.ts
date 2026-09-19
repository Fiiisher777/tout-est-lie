import { HomeScreen } from '../../screens/HomeScreen';
import DraftPreviewRoute from '../../app/draft-preview';
import type { ReactElement } from 'react';
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() } }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), Redirect: 'Redirect' }));
jest.mock('../../state/PlayerProvider', () => ({ usePlayer: () => ({ state: { completedLevels: [], preferences: { language: 'fr' } }, writable: true }) }));
jest.mock('../../i18n', () => ({ useTranslation: () => ({ locale: 'fr', t: (key: string) => key }) }));
function homeTitles() {
  const home = HomeScreen() as ReactElement<{ children: (ReactElement<{ title?: string }> | false)[] }>;
  return home.props.children.filter(Boolean).map(child => (child as ReactElement<{ title?: string }>).props.title);
}
test('Home shows the Draft Preview entry in development', () => { expect(homeTitles()).toContain('Draft Preview'); });
test('production hides the actual Home entry and redirects a direct preview route', () => {
  const flag = jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
  try {
    expect(homeTitles()).not.toContain('Draft Preview');
    const route = DraftPreviewRoute() as ReactElement<{ href: string }>;
    expect(route.props.href).toBe('/');
  } finally { flag.restore(); }
});
