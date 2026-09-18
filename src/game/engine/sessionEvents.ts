import type { AnalyticsService, EventPayload } from '../../services/analytics';
import { elapsedTime, produceCompletionResult, type State } from './engine';
// Owned by one mounted game view. Keeps analytics independent of React effects.
export function createSessionEvents(service: AnalyticsService, utcNow: () => number) {
  const started = new Set<string>(); const ended = new Set<string>(); const sequences = new Map<string, number>();
  function emit(s: State, payload: EventPayload) {
    const sequence = (sequences.get(s.sessionId) ?? 0) + 1; sequences.set(s.sessionId, sequence);
    service.track({ ...s.launch, sessionId: s.sessionId, sequence, occurredAt: new Date(utcNow()).toISOString(), ...payload });
  }
  return {
    emit,
    resume(s: State) { started.add(s.sessionId); },
    start(s: State) {
      if (started.has(s.sessionId)) return;
      started.add(s.sessionId); emit(s, { name: 'puzzle_started', difficulty: s.puzzle.difficulty });
      if (s.launch.mode === 'daily') emit(s, { name: 'daily_started', date: s.launch.date });
    },
    finish(s: State) {
      const result = produceCompletionResult(s);
      if (!result || ended.has(s.sessionId)) return;
      ended.add(s.sessionId); emit(s, { name: s.status === 'won' ? 'puzzle_completed' : 'puzzle_failed', result });
      if (s.launch.mode === 'daily') emit(s, { name: 'daily_completed', date: s.launch.date, result });
    },
    abandon(s: State, now: number, reason: 'leave' | 'restart') {
      if (!started.has(s.sessionId) || ended.has(s.sessionId) || s.status !== 'playing') return;
      ended.add(s.sessionId); emit(s, { name: 'level_abandoned', elapsedMs: Math.round(elapsedTime(s, now)), reason });
    },
  };
}
