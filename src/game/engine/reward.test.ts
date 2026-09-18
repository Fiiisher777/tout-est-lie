import { rewardedHint } from './reward';
import { findPuzzle } from '../content';
import { startPuzzle } from './engine';
import type { AdOutcome, AdsService } from '../../services/ads';
const fresh = () => startPuzzle(findPuzzle('en-easy')!, { launch: { mode: 'level', levelId: 'en-easy', locale: 'en', puzzleRevision: 1 }, sessionId: 'test', seed: 1, clock: { monotonicMs: 0, utcMs: 0 } });
test.each(['dismissed', 'unavailable'] as const)('%s does not spend hint', async outcome => { const apply = jest.fn(); await rewardedHint({ showRewarded: async () => outcome } as AdsService, 'test', 'pair0', fresh, apply); expect(apply).not.toHaveBeenCalled(); });
test('reward applies once and rejects duplicate delivery', async () => { let s = fresh(); const ads = { showRewarded: async () => 'rewarded' as const } as AdsService; const apply = jest.fn(t => { s = t.state; }); await rewardedHint(ads, 'test', 'pair0', () => s, apply); await rewardedHint(ads, 'test', 'pair0', () => s, apply); expect(apply).toHaveBeenCalledTimes(1); expect(s.usedHints).toEqual(['pair0']); });
test.each(['replaced', 'unmounted'])('late reward ignored when %s', async reason => { let resolve!: (v: AdOutcome) => void; const apply = jest.fn(); const pending = rewardedHint({ showRewarded: () => new Promise(r => { resolve = r; }) } as AdsService, 'test', 'pair0', () => reason === 'unmounted' ? null : { ...fresh(), sessionId: 'new' }, apply); resolve('rewarded'); await pending; expect(apply).not.toHaveBeenCalled(); });
test('ad failure is contained', async () => { const apply = jest.fn(); await rewardedHint({ showRewarded: async () => { throw new Error('network'); } } as unknown as AdsService, 'test', 'pair0', fresh, apply); expect(apply).not.toHaveBeenCalled(); });
