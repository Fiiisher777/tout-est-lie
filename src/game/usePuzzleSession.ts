import { loadActiveSession, matchesLaunch, saveActiveSession } from '../state/activeSession';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { findPuzzle } from './content';
import type { GameViewProps } from './types';
import { rewardedHint } from './engine/reward';
import { calculateRemainingMistakes, getAvailableHints, produceCompletionResult, setPaused, startPuzzle, type State, type Transition } from './engine/engine';
import { createSessionEvents } from './engine/sessionEvents';
import { analytics } from '../services/analytics';
import type { AdsService } from '../services/ads';
import { hapticFeedback } from '../services/haptics';
import { usePlayer } from '../state/PlayerProvider';
export const clock = () => ({ monotonicMs: performance.now(), utcMs: Date.now() });
let sessionCounter = 0;
function newId() { return `${Date.now()}-${++sessionCounter}-${Math.random().toString(36).slice(2, 8)}`; }
export function usePuzzleSession({ launch, onComplete }: GameViewProps, ads: AdsService) {
  const { state: player } = usePlayer();
  function fresh() { return startPuzzle(findPuzzle(launch.levelId)!, { launch, sessionId: newId(), seed: Math.floor(Math.random() * 4294967296), clock: clock() }); }
  const [loadAttempt, setLoadAttempt] = useState(0);
  const focused = useRef(true);
  const [ready, setReady] = useState(false); const readyRef = useRef(false);
  const [storageError, setStorageError] = useState(false);
  const [state, render] = useState(fresh); const current = useRef(state);
  const [adBusy, setAdBusy] = useState(false); const requesting = useRef(false);
  const [saving, setSaving] = useState(false); const savingRef = useRef(false);
  const [feedback, setFeedback] = useState<'solved' | 'mistake' | null>(null);
  const mounted = useRef(false);
  const [events] = useState(() => createSessionEvents(analytics, Date.now));
  const persist = useCallback((next: State) => { if (!focused.current) return Promise.resolve(); return saveActiveSession(next, performance.now()).then(() => { if (mounted.current) setStorageError(false); }, () => { if (mounted.current) setStorageError(true); }); }, []);
  const update = useCallback((next: State) => { current.current = next; if (readyRef.current) void persist(next); if (mounted.current) render(next); }, [persist]);
  const pause = useCallback((reason: 'app' | 'ad' | 'navigation', value: boolean) => update(setPaused(current.current, reason, value, performance.now())), [update]);
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    void loadActiveSession().then(saved => {
      if (cancelled) return;
      let next: State = { ...current.current, elapsedMs: 0, activeSince: performance.now() };
      if (saved && matchesLaunch(saved, launch)) { next = { ...saved, activeSince: performance.now(), pauses: [] }; events.resume(next); }
      else {
        if (saved) { events.resume(saved); events.abandon(saved, performance.now(), 'leave'); }
        events.start(next);
      }
      next = setPaused(next, 'navigation', !focused.current, performance.now());
      next = setPaused(next, 'app', AppState.currentState !== 'active', performance.now());
      readyRef.current = true; update(next); setReady(true);
    }).catch(() => { if (!cancelled) setStorageError(true); });
    const listener = AppState.addEventListener('change', status => pause('app', status !== 'active'));
    const timer = setInterval(() => { if (readyRef.current && current.current.status === 'playing') void persist(current.current); }, 1000);
    return () => {
      cancelled = true; mounted.current = false; listener.remove(); clearInterval(timer);
      if (readyRef.current) pause('navigation', true);
    };
    // The view is keyed by launch; hydration runs once for that launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, pause, persist, loadAttempt]);
  useFocusEffect(useCallback(() => { focused.current = true; pause('navigation', false); return () => { pause('navigation', true); focused.current = false; }; }, [pause]));
  function act(operation: (s: State) => Transition) {
    if (!readyRef.current || storageError) return;
    const previous = current.current; const transition = operation(previous);
    if (transition.outcome === 'rejected') return;
    update(transition.state);
    if (transition.outcome === 'solved' || transition.outcome === 'mistake') {
      setFeedback(transition.outcome);
      events.emit(previous, { name: 'group_submitted', cardIds: previous.selected, correct: transition.outcome === 'solved' });
      if (transition.groupId) events.emit(transition.state, { name: 'group_solved', groupId: transition.groupId, solvedCount: transition.state.solved.length });
      else events.emit(transition.state, { name: 'mistake_made', mistakes: transition.state.mistakes, remainingMistakes: calculateRemainingMistakes(transition.state) });
    }
    void hapticFeedback(player.preferences.haptics, transition.outcome === 'solved' ? 'complete' : 'press');
    events.finish(transition.state);
  }
  async function requestHint() {
    if (!readyRef.current || storageError || requesting.current) return;
    const hint = getAvailableHints(current.current)[0]; if (!hint) return;
    const session = current.current.sessionId;
    requesting.current = true; setAdBusy(true);
    events.emit(current.current, { name: 'hint_requested', hintId: hint.id, hintKind: hint.kind });
    pause('ad', true);
    try {
      await rewardedHint(ads, session, hint.id, () => mounted.current ? current.current : null, transition => {
        update(transition.state);
        events.emit(transition.state, { name: 'hint_used', hintId: hint.id, hintKind: hint.kind });
      });
    } catch { /* Unavailable reward never spends a hint. */ }
    finally { if (mounted.current && current.current.sessionId === session) { pause('ad', false); requesting.current = false; setAdBusy(false); } }
  }
  function restart() {
    if (!readyRef.current || storageError || requesting.current || savingRef.current) return;
    const next = fresh(); events.emit(current.current, { name: 'puzzle_restarted', nextSessionId: next.sessionId });
    events.abandon(current.current, performance.now(), 'restart');
    update(AppState.currentState === 'active' ? next : setPaused(next, 'app', true, performance.now())); setFeedback(null); events.start(next);
  }
  const save = useCallback(async () => {
    const result = produceCompletionResult(current.current); if (!result || savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try { await saveActiveSession(current.current, performance.now()); await onComplete(result); } catch { /* Shell displays retryable failure. */ }
    finally { savingRef.current = false; if (mounted.current) setSaving(false); }
  }, [onComplete]);
  const automaticSave = useRef<string | null>(null);
  useEffect(() => {
    if (state.status !== 'playing' && automaticSave.current !== state.sessionId) {
      automaticSave.current = state.sessionId;
      void save();
    }
  }, [state.status, state.sessionId, save]);
  function retryStorage() { if (readyRef.current) void persist(current.current); else { setStorageError(false); setLoadAttempt(n => n + 1); } }
  return { state, ready, storageError, retryStorage, act, requestHint, restart, save, saving, adBusy, feedback };
}
