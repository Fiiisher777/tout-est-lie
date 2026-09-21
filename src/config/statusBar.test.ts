/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Regression: react-native-screens appearance overrides assert in Expo Go iOS.
test.each(['../app/_layout.tsx', '../screens/HomeScreen.tsx'])('%s avoids native status-bar overrides', file => {
  const source = readFileSync(resolve(__dirname, file), 'utf8');
  expect(source).not.toMatch(/statusBarStyle\s*:/);
});
test('root retains established Expo status bar without route-specific setters', () => {
  const source = readFileSync(resolve(__dirname, '../app/_layout.tsx'), 'utf8');
  expect(source).toContain('<StatusBar style="dark" />');
  expect(source).not.toContain('screenStatusBarStyle(');
  expect(source).not.toContain('setStatusBarStyle(');
});
