export const levels = [
    { id: 'level-1', number: 1 }, { id: 'level-2', number: 2 },
    { id: 'level-3', number: 3 }, { id: 'level-4', number: 4 },
    { id: 'level-5', number: 5 }, { id: 'level-6', number: 6 },
] as const;
export function findLevel(id: string) { return levels.find(level => level.id === id); }
