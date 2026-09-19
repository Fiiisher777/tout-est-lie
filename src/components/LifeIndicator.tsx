import { useState } from 'react';
import { View } from 'react-native';
import { useEconomy } from '../economy/useEconomy';
import { economyStore } from '../economy/store';
import { playtest, formatTime } from '../config/playtest';
import { entitlements } from '../services/entitlements';
import { placeholderAds } from '../services/ads';
import { useTranslation } from '../i18n';
import { AppText } from './AppText';
import { Button } from './Button';
export function LifeIndicator({ compact = false, onReward }: { compact?: boolean; onReward?: () => void }) {
  const { t } = useTranslation(); const { value, ready, error, now } = useEconomy();
  const [busy, setBusy] = useState(false); const [rewardError, setRewardError] = useState(false);
  if (!playtest.enabled) return null;
  if (!ready || error) return <View><AppText variant="muted">{t(error ? 'storageRead' : 'loading')}</AppText>{error && <Button title={t('retry')} onPress={() => { void economyStore.refresh().catch(() => {}); }} />}</View>;
  return <View style={{ gap: 6 }}>
    <AppText variant="muted" accessibilityLabel={t(entitlements.isPremium ? 'unlimitedLives' : 'lifeCount', { count: value.lives, max: playtest.maxLives })}>{entitlements.isPremium ? '♥ ∞' : `♥ ${value.lives}/${playtest.maxLives}`}</AppText>
    {!compact && !entitlements.isPremium && value.regenAt !== null && <AppText variant="muted">{t('nextLife', { time: formatTime(value.regenAt - now) })}</AppText>}
    {!compact && !entitlements.isPremium && value.lives === 0 && <>
      <AppText>{t('noLives')}</AppText>
      <Button secondary title={t('rewardLife')} disabled={busy} onPress={() => {
        setBusy(true); setRewardError(false);
        const ads = placeholderAds({ title: t('adTitle'), body: t('simulatedAdBody'), reward: t('completeAd'), cancel: t('cancel') });
        void economyStore.rewardLife(ads).then(ok => { if (ok) onReward?.(); }).catch(() => setRewardError(true)).finally(() => setBusy(false));
      }} />
    </>}
    {rewardError && <AppText>{t('saveFailedBody')}</AppText>}
  </View>;
}
