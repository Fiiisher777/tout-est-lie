import type { AdsService } from '../../services/ads';
import { applyHint, type State, type Transition } from './engine';
// Resolve against current session after async work; never reward a replaced session.
export async function rewardedHint(ads: AdsService, sessionId: string, hintId: string, current: () => State | null, apply: (transition: Transition) => void): Promise<void> {
  try {
    if (await ads.showRewarded() !== 'rewarded') return;
    const state = current();
    if (!state || state.sessionId !== sessionId) return;
    const transition = applyHint(state, hintId);
    if (transition.outcome === 'hint') apply(transition);
  } catch { /* Failed/unavailable ads never spend hints. */ }
}
