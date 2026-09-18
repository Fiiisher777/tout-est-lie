// Exercise the actual app content entry point, not just the filtering helper.
test('release runtime exposes neither sample drafts nor development fixtures', () => {
  const flag = jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
  try {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const content = require('../content') as typeof import('../content');
      expect(content.puzzles).toEqual([]);
      expect(content.findPuzzle('en-easy')).toBeUndefined();
      expect(content.findPuzzle('sample-en-001')).toBeUndefined();
      expect(content.hasDailyContent('en')).toBe(false);
      expect(content.levelsFor('fr')).toEqual([]);
    });
  } finally { flag.restore(); }
});
test('ordinary development still offers existing fixtures with a partial production catalog', () => {
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const content = require('../content') as typeof import('../content');
    expect(content.findPuzzle('en-easy')).toBeDefined();
    expect(content.hasDailyContent('en')).toBe(true);
    expect(content.findPuzzle('sample-en-001')).toBeUndefined();
  });
});
