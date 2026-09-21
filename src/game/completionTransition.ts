import type { Transition } from './engine/engine';
import type { GameResult } from './types';

// Presentation-only handshake. Persistence and engine transitions never wait here.
export function createCompletionTransition() {
  let pending: { sessionId: string; ready: Promise<void>; finish: () => void } | undefined;
  const completions = new Map<string, Promise<void>>();
  return {
    observe(transition: Transition) {
      if (transition.outcome !== 'solved' || transition.state.status !== 'won') return;
      if (pending?.sessionId === transition.state.sessionId) return;
      let finish!: () => void;
      const ready = new Promise<void>(resolve => { finish = resolve; });
      pending = { sessionId: transition.state.sessionId, ready, finish };
    },
    finish(sessionId: string) { if (pending?.sessionId === sessionId) pending.finish(); },
    complete(result: GameResult, onComplete: (result: GameResult) => Promise<void>): Promise<void> {
      const existing = completions.get(result.sessionId);
      if (existing) return existing;
      const ready = result.outcome === 'won' && pending?.sessionId === result.sessionId ? pending.ready : Promise.resolve();
      const completion = ready.then(() => onComplete(result)).catch(error => {
        completions.delete(result.sessionId); // Preserve the existing retry on save/navigation failure.
        throw error;
      });
      completions.set(result.sessionId, completion);
      return completion;
    },
  };
}
