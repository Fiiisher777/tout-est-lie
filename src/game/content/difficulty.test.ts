import catalog from '../../../content/production/puzzles.json';
import { difficultyForPosition, releaseDifficultyProfile } from './difficulty';
import { validateProductionPuzzle, releaseCheck } from './production/validate';
import { productionSummary } from './production/report';
const expected = [...Array<number>(10).fill(1), ...Array<number>(25).fill(2), ...Array<number>(25).fill(3), ...Array<number>(20).fill(4), ...Array<number>(20).fill(5)];
test('shared profile covers exactly 100 positions with 10/25/25/20/20 distribution', () => {
  expect(expected.map((_, i) => difficultyForPosition(i + 1))).toEqual(expected);
  expect(releaseDifficultyProfile.map(b => b.last - b.first + 1)).toEqual([10, 25, 25, 20, 20]);
});
test.each([0, -1, 101, 1.5, NaN, Infinity])('invalid position %s has no difficulty', position => { expect(difficultyForPosition(position)).toBeUndefined(); });
test('individual structural validation rejects every wrong difficulty at every position', () => {
  const template = catalog.find(p => p.locale === 'fr' && p.position === 1)!;
  expected.forEach((difficulty, index) => {
    for (let candidate = 1; candidate <= 5; candidate++) {
      const errors = validateProductionPuzzle({ ...template, position: index + 1, difficulty: candidate });
      expect(errors.some(e => e.path === 'difficulty')).toBe(candidate !== difficulty);
    }
  });
});
test('reports expose target ranges and release-check rejects the old profile', () => {
  expect(productionSummary(catalog).difficultyProfile).toEqual(releaseDifficultyProfile.map(b => ({ ...b, levelsPerLocale: b.last - b.first + 1 })));
  const old = { ...catalog.find(p => p.locale === 'fr' && p.position === 11)!, difficulty: 1 };
  expect(releaseCheck([old]).some(e => e.path === `${old.levelId}.difficulty`)).toBe(true);
});
