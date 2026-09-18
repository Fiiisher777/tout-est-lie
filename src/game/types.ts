import type { DevelopmentPreview } from './sessionAccess';
import type { Locale } from './content/schema';
export type GameLaunch = { levelId: string; locale: Locale; puzzleRevision: number } & ({ mode: 'level' } | { mode: 'daily'; date: string });
export type GameResult = GameLaunch & { id: string; sessionId: string; outcome: 'won' | 'lost'; mistakes: number; hintsUsed: number; elapsedMs: number; completedAt: string };
export type GameViewProps = { developmentPreview?: DevelopmentPreview; launch: GameLaunch; onComplete: (result: GameResult) => Promise<void> };
