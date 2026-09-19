/* eslint-disable @typescript-eslint/no-require-imports */
import catalog from '../../content/production/puzzles.json';
import { releasePuzzles } from '../game/content/production/release';
import { startPuzzle, selectCard, submitSelection, produceCompletionResult } from '../game/engine/engine';
import { defaultPlayer, playerReducer } from '../state/player';
import type { ReactElement } from 'react';
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() } }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), Redirect: 'Redirect' }));
jest.mock('../state/PlayerProvider', () => ({ usePlayer: () => ({ state: { completedLevels: [], preferences: { language: 'fr' } }, writable: true }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ locale: 'fr', t: (key: string) => key }) }));
function mode(variant: string | undefined, dev: boolean, check: () => void) {
  const flag = jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', dev);
  jest.doMock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: { appVariant: variant } } } }));
  try { jest.isolateModules(check); } finally { flag.restore(); jest.dontMock('expo-constants'); }
}
test('standalone tester exposes exactly FR 1–10 and enables economy without __DEV__', () => mode('tester', false, () => {
  const content = require('../game/content') as typeof import('../game/content');
  expect(content.levelsFor('fr').map(p => p.number)).toEqual([1,2,3,4,5,6,7,8,9,10]);
  expect(content.levelsFor('en')).toEqual([]);
  expect(content.puzzles.every(p => p.review.status === 'draft')).toBe(true);
  const { countdownDuration } = require('./playtest') as typeof import('./playtest');
  expect(countdownDuration(1, 4)).toBe(120000);
  expect(countdownDuration(1, 1)).toBeNull();
  expect(require('./environment').playtestEnabled).toBe(true);
}));
test.each([undefined, 'production', 'unknown'])('release fails closed for variant %s', variant => mode(variant, false, () => {
  expect(require('../game/content').puzzles).toEqual([]);
  expect(require('../game/content/tester').testerPacks(catalog)).toEqual([]);
  expect(require('./environment').isTester).toBe(false);
  expect(require('./playtest').playtest.enabled).toBe(false);
}));
test.each(['tester','production'])('%s has no Draft Preview entry or usable route', variant => mode(variant, false, () => {
  const home = require('../screens/HomeScreen').HomeScreen() as ReactElement<{ children: (ReactElement<{ title?: string }> | false)[] }>;
  expect(home.props.children.filter(Boolean).map(c => (c as ReactElement<{title?: string}>).props.title)).not.toContain('Draft Preview');
  expect(require('../app/draft-preview').default().props.href).toBe('/');
  expect(require('../game/preview/drafts').draftPuzzles()).toEqual([]);
}));
test('development fixtures and Draft Preview still work', () => mode(undefined, true, () => {
  expect(require('../game/preview/drafts').draftPuzzles().length).toBeGreaterThanOrEqual(15);
  expect(require('../game/content').findPuzzle('en-easy')).toBeDefined();
}));
test('tester completion changes player progress only, never approval or catalog', () => mode('tester', false, () => {
  const before = JSON.stringify(catalog);
  const p = (require('../game/content') as typeof import('../game/content')).puzzles[0];
  let state = startPuzzle(p, { sessionId: 'tester', seed: 1, launch: { mode: 'level', levelId: p.levelId, locale: 'fr', puzzleRevision: 1 }, clock: { monotonicMs: 0, utcMs: 0 } });
  for (const group of p.groups) {
    for (const id of group.cardIds) state = selectCard(state, id).state;
    state = submitSelection(state, { monotonicMs: 100, utcMs: 100 }).state;
  }
  expect(playerReducer(defaultPlayer(), { type: 'complete', result: produceCompletionResult(state)! }).completedLevels).toContain(p.levelId);
  expect(JSON.stringify(catalog)).toBe(before);
  expect(releasePuzzles(catalog)).toEqual([]);
  p.cards[0].text = 'runtime mutation';
  expect(JSON.stringify(catalog)).toBe(before);
}));
test.each([undefined, 'development', 'tester', 'production'])('app configuration separates %s identity', variant => {
  const before = process.env.APP_VARIANT;
  if (variant) process.env.APP_VARIANT = variant; else delete process.env.APP_VARIANT;
  try { jest.isolateModules(() => {
    const config = require('../../app.config').default;
    expect(config.name).toBe(variant === 'tester' ? 'NODI Beta' : 'NODI');
    expect(config.android.package).toBe(variant === 'tester' ? 'com.nodi.playtest.tester' : undefined);
    expect(config.ios.bundleIdentifier).toBeUndefined();
    expect(config.extra.appVariant).toBe(variant);
  }); } finally { if (before === undefined) delete process.env.APP_VARIANT; else process.env.APP_VARIANT = before; }
});
test('production build profile rejects a tester flag', () => {
  const env = { ...process.env };
  process.env.EAS_BUILD_PROFILE = 'production'; process.env.APP_VARIANT = 'tester';
  try { jest.isolateModules(() => expect(() => require('../../app.config')).toThrow('Production profile')); }
  finally { process.env = env; }
});

test('standalone tester rewards use the placeholder boundary, production has no rewards', async () => {
  let reward: Promise<string> | undefined;
  mode('tester', false, () => {
    const { Alert } = require('react-native') as typeof import('react-native');
    const dialog = jest.spyOn(Alert, 'alert').mockImplementation((_title, _body, buttons) => { buttons?.[1].onPress?.(); });
    const { placeholderAds } = require('../services/ads') as typeof import('../services/ads');
    reward = placeholderAds({ title: 'Test reward', body: 'No advertisement', reward: 'Continue', cancel: 'Cancel' }).showRewarded();
    expect(dialog).toHaveBeenCalled(); dialog.mockRestore();
  });
  await expect(reward).resolves.toBe('rewarded');
  mode('production', false, () => {
    reward = require('../services/ads').placeholderAds({ title: '', body: '', reward: '', cancel: '' }).showRewarded();
  });
  await expect(reward).resolves.toBe('unavailable');
});
test('tester content fails closed for incomplete or malformed selection', () => mode('tester', false, () => {
  const { testerPacks } = require('../game/content/tester') as typeof import('../game/content/tester');
  expect(testerPacks(catalog.filter(p => p.locale !== 'fr' || p.position !== 4))).toEqual([]);
  expect(testerPacks([{ status: 'draft' }])).toEqual([]);
}));
