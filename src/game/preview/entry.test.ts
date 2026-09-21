import { HomeScreen } from '../../screens/HomeScreen';
import DraftPreviewRoute from '../../app/draft-preview';
import React, { type ReactElement } from 'react';
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() } }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), Redirect: 'Redirect', Stack: { Screen: 'StackScreen' } }));
jest.mock('../../state/PlayerProvider', () => ({ usePlayer: () => ({ state: { highestUnlockedLevel: { fr: 1, en: 1, es: 1 }, completedLevels: [], preferences: { language: 'fr' } }, writable: true }) }));
jest.mock('../../i18n', () => ({ useTranslation: () => ({ locale: 'fr', t: (key: string) => key }) }));

function homeLabels(node: React.ReactNode): string[] {
  if (!React.isValidElement(node)) return [];
  const e = node as ReactElement<{label?:string;children?:React.ReactNode}>;
  return [...(e.props.label ? [e.props.label] : []), ...React.Children.toArray(e.props.children).flatMap(homeLabels)];
}
function homeTitles() { return homeLabels(HomeScreen()); }
test('Home shows the Draft Preview entry in development', () => { expect(homeTitles()).toContain('Draft Preview'); });
test('production hides the actual Home entry and redirects a direct preview route', () => {
  const flag = jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
  try {
    expect(homeTitles()).not.toContain('Draft Preview');
    const route = DraftPreviewRoute() as ReactElement<{ href: string }>;
    expect(route.props.href).toBe('/');
  } finally { flag.restore(); }
});
