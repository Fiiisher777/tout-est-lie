// Shared release profile for every locale. Development fixtures may opt out.
export const releaseDifficultyProfile = [
  { first: 1, last: 10, difficulty: 1 },
  { first: 11, last: 35, difficulty: 2 },
  { first: 36, last: 60, difficulty: 3 },
  { first: 61, last: 80, difficulty: 4 },
  { first: 81, last: 100, difficulty: 5 },
] as const;
export function difficultyForPosition(position: number) {
  if (!Number.isInteger(position)) return undefined;
  return releaseDifficultyProfile.find(band => position >= band.first && position <= band.last)?.difficulty;
}
