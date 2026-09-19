import { useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { economyStore } from './store';
import { playtest } from '../config/playtest';
export function useEconomy(enabled = true) {
  const state = useSyncExternalStore(economyStore.subscribe, economyStore.snapshot, economyStore.snapshot);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!enabled || !playtest.enabled) return;
    const refresh = () => { setNow(Date.now()); void economyStore.refresh().catch(() => {}); };
    refresh(); const timer = setInterval(refresh, 1000);
    const listener = AppState.addEventListener('change', status => { if (status === 'active') refresh(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [enabled]);
  return { ...state, now };
}
