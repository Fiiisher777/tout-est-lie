import { playtest } from '../config/playtest';
export type Economy = { version: 1; lives: number; regenAt: number | null; settledFailures: string[] };
export const regenInterval = () => playtest.lifeRegenMinutes * 60000;
export function initialEconomy(): Economy { return { version: 1, lives: playtest.maxLives, regenAt: null, settledFailures: [] }; }
export function regenerate(s: Economy, now: number): Economy {
  if (s.regenAt === null || now < s.regenAt || s.lives >= playtest.maxLives) return s;
  const count = Math.floor((now - s.regenAt) / regenInterval()) + 1;
  const lives = Math.min(playtest.maxLives, s.lives + count);
  return { ...s, lives, regenAt: lives === playtest.maxLives ? null : s.regenAt + count * regenInterval() };
}
export function canStart(s: Economy, now: number, premium = false) { return premium || regenerate(s, now).lives > 0; }
export function settleFailure(s: Economy, sessionId: string, now: number, premium = false): Economy {
  const current = regenerate(s, now);
  if (current.settledFailures.includes(sessionId)) return current;
  if (premium) return { ...current, settledFailures: [...current.settledFailures, sessionId] };
  return { ...current, lives: Math.max(0, current.lives - 1), regenAt: current.regenAt ?? now + regenInterval(), settledFailures: [...current.settledFailures, sessionId] };
}
export function grantLife(s: Economy, now: number): Economy {
  const current = regenerate(s, now); const lives = Math.min(playtest.maxLives, current.lives + 1);
  return { ...current, lives, regenAt: lives === playtest.maxLives ? null : current.regenAt };
}
export function decodeEconomy(raw: string | null): Economy {
  if (raw === null) return initialEconomy();
  const s = JSON.parse(raw) as Economy;
  if (!s || s.version !== 1 || !Number.isInteger(s.lives) || s.lives < 0 || !Number.isFinite(s.lives) || !(s.regenAt === null || (Number.isFinite(s.regenAt) && s.regenAt >= 0)) || !Array.isArray(s.settledFailures) || !s.settledFailures.every(id => typeof id === 'string')) throw new Error('Invalid or future economy save');
  const lives = Math.min(playtest.maxLives, s.lives);
  if (lives < playtest.maxLives && s.regenAt === null) throw new Error('Missing regeneration timestamp');
  return { ...s, lives, regenAt: lives === playtest.maxLives ? null : s.regenAt };
}
