export type GameLaunch = {
    mode: 'level';
    levelId: string;
} | {
    mode: 'daily';
    levelId: string;
    date: string;
};
// Higher scores are better in the shell. Engines normalize their own scoring.
export type GameResult = GameLaunch & {
    id: string;
    score: number;
    completedAt: string;
};
export type GameViewProps = {
    launch: GameLaunch;
    onComplete: (score: number) => Promise<void>;
};
