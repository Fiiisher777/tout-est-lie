import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameConfig } from '../config/game';
import { playtest } from '../config/playtest';
import { analytics } from '../services/analytics';
import { entitlements } from '../services/entitlements';
import { canStart, decodeEconomy, initialEconomy, regenerate, settleFailure, grantLife, type Economy } from './model';
import type { AdsService } from '../services/ads';
export function createEconomyStore(storage: { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void> }, now = Date.now) {
  const key = `${gameConfig.id}:economy`;
  let value = initialEconomy(); let loaded = false; let queue = Promise.resolve(); let rewardBusy = false;
  const listeners = new Set<() => void>();
  let snapshot = { value, ready: false, error: false };
  const publish = (error = false) => { snapshot = { value, ready: loaded, error }; listeners.forEach(f => f()); };
  function update(operation: (s: Economy, timestamp: number) => Economy) {
    const work = queue.catch(() => {}).then(async () => {
      if (!loaded) value = decodeEconomy(await storage.getItem(key));
      const timestamp = now(); const regenerated = regenerate(value, timestamp); const next = operation(regenerated, timestamp);
      if (!loaded || JSON.stringify(next) !== JSON.stringify(value)) await storage.setItem(key, JSON.stringify(next));
      const count = regenerated.lives - value.lives;
      value = next; loaded = true; publish();
      if (count > 0) analytics.track({ name: 'life_regenerated', count, lives: value.lives });
      return value;
    }).catch(error => { publish(true); throw error; });
    queue = work.then(() => {}, () => {}); return work;
  }
  return {
    snapshot: () => snapshot,
    subscribe: (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; },
    refresh: () => update(s => s),
    canStart: async () => !playtest.enabled || canStart(await update(s => s), now(), entitlements.isPremium),
    settle: async (sessionId: string) => {
      let charged = 0;
      const next = await update((s, timestamp) => {
        const settled = settleFailure(s, sessionId, timestamp, entitlements.isPremium);
        charged = s.lives - settled.lives; return settled;
      });
      if (charged) analytics.track({ name: 'life_consumed', count: charged, lives: next.lives });
      return next;
    },
    rewardLife: async (ads: AdsService) => {
      if (rewardBusy) return false; rewardBusy = true;
      try {
        analytics.track({ name: 'rewarded_life_requested' });
        if (!entitlements.isPremium && await ads.showRewarded() !== 'rewarded') return false;
        const next = await update((s, timestamp) => grantLife(s, timestamp));
        analytics.track({ name: 'rewarded_life_completed', lives: next.lives }); return true;
      } finally { rewardBusy = false; }
    },
  };
}
export const economyStore = createEconomyStore(AsyncStorage);
