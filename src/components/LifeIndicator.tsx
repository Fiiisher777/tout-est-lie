import { ProfessorReaction } from '../lore/components';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { homeTheme } from '../config/theme';
import { useEconomy } from '../economy/useEconomy';
import { economyStore } from '../economy/store';
import { playtest, formatTime } from '../config/playtest';
import { entitlements } from '../services/entitlements';
import { placeholderAds } from '../services/ads';
import { useTranslation } from '../i18n';
import { AppText } from './AppText';
import { Button } from './Button';
export function LifeIndicator({ compact = false, home = false, onReward }: { compact?: boolean; home?: boolean; onReward?: () => void }) {
  const { t } = useTranslation(); const { value, ready, error, now } = useEconomy();
  const [busy, setBusy] = useState(false); const [rewardError, setRewardError] = useState(false);
  const Action = home ? HomeLifeAction : Button;
  if (!playtest.enabled) return null;
  if (!ready || error) return <View><AppText variant="muted">{t(error ? 'storageRead' : 'loading')}</AppText>{error && <Action title={t('retry')} onPress={() => { void economyStore.refresh().catch(() => {}); }} />}</View>;
  return <View style={{ gap: 6 }}>
    <AppText variant="muted" style={home ? {color:homeTheme.text,fontSize:14} : undefined} accessibilityLabel={t(entitlements.isPremium ? 'unlimitedLives' : 'lifeCount', { count: value.lives, max: playtest.maxLives }) + (home && !entitlements.isPremium && value.regenAt !== null ? `. ${t('nextLife', { time: formatTime(value.regenAt - now) })}` : '')}>{entitlements.isPremium ? '♥ ∞' : `♥ ${value.lives}/${playtest.maxLives}`}{home && !entitlements.isPremium && value.regenAt !== null ? `  ·  ${t('nextLifeCompact', { time: formatTime(value.regenAt - now) })}` : ''}</AppText>
    {!home && !compact && !entitlements.isPremium && value.regenAt !== null && <AppText variant="muted">{t('nextLife', { time: formatTime(value.regenAt - now) })}</AppText>}
    {!compact && !entitlements.isPremium && value.lives === 0 && <>
      <AppText>{t('noLives')}</AppText>
      {!home && <ProfessorReaction kind="zeroLives" seed={String(value.regenAt)} />}
      <Action secondary title={t('rewardLife')} disabled={busy} onPress={() => {
        setBusy(true); setRewardError(false);
        const ads = placeholderAds({ title: t('adTitle'), body: t('simulatedAdBody'), reward: t('completeAd'), cancel: t('cancel') });
        void economyStore.rewardLife(ads).then(ok => { if (ok) onReward?.(); }).catch(() => setRewardError(true)).finally(() => setBusy(false));
      }} />
    </>}
    {rewardError && <AppText>{t('saveFailedBody')}</AppText>}
  </View>;
}

function HomeLifeAction({title,onPress,disabled=false}:{title:string;onPress:()=>void;disabled?:boolean;secondary?:boolean}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={{minHeight:homeTheme.tapTarget,padding:12,justifyContent:'center'}}>
    <Text style={{color:homeTheme.text,fontSize:15,lineHeight:22,textAlign:'center',opacity:disabled?0.6:1}}>{title}</Text>
  </Pressable>;
}
