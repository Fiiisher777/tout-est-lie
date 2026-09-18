import type { GameLaunch, GameResult } from '../game/types';
type Payload =
  | { name: 'puzzle_started'; difficulty: number }
  | { name: 'group_submitted'; cardIds: readonly string[]; correct: boolean }
  | { name: 'group_solved'; groupId: string; solvedCount: number }
  | { name: 'mistake_made'; mistakes: number; remainingMistakes: number }
  | { name: 'hint_requested' | 'hint_used'; hintId: string; hintKind: 'pair' | 'category' }
  | { name: 'puzzle_completed' | 'puzzle_failed'; result: GameResult }
  | { name: 'puzzle_restarted'; nextSessionId: string }
  | { name: 'level_abandoned'; elapsedMs: number; reason: 'leave' | 'restart' }
  | { name: 'daily_started'; date: string }
  | { name: 'daily_completed'; date: string; result: GameResult };
export type PuzzleEvent = GameLaunch & { sessionId: string; sequence: number; occurredAt: string } & Payload;
export type AnalyticsEvent = PuzzleEvent | { name: 'progress_reset' };
export interface AnalyticsService { track(event: AnalyticsEvent): void }
export const analytics: AnalyticsService = { track: (_event) => {} };
export type EventPayload = Payload;
