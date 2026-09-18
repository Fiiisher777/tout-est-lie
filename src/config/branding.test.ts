import config from '../../app.config';
import { gameConfig } from './game';
import { en } from '../i18n/en';
import { fr } from '../i18n/fr';
import { es } from '../i18n/es';
test('application display name is NODI', () => {
  expect(config.name).toBe('NODI');
  expect(gameConfig.name).toBe('NODI');
});
test.each([['fr', fr, 'Tout est lié.'], ['en', en, 'Find the connection.'], ['es', es, 'Encuentra la conexión.']] as const)('%s uses the invariant product name and localized tagline', (_, copy, tagline) => {
  expect(copy.productName).toBe('NODI');
  expect(copy.productName).toBe(config.name);
  expect(copy.tagline).toBe(tagline);
});
test('branding retains technical identifiers and save namespace', () => {
  expect(config.slug).toBe('tiny-game-starter');
  expect(config.scheme).toBe('tinygamestarter');
  expect(gameConfig.id).toBe('tiny-game-starter');
});
