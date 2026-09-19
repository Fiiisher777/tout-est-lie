import { Alert } from 'react-native';
export type AdOutcome = 'unavailable' | 'dismissed' | 'rewarded';
export interface AdsService { showInterstitial(): Promise<AdOutcome>; showRewarded(): Promise<AdOutcome> }
// Explicit simulation only: no SDK, tracking, requests, or implicit reward.
export function placeholderAds(labels: { title: string; body: string; reward: string; cancel: string }): AdsService {
  return { showInterstitial: async () => 'unavailable', showRewarded: () => !__DEV__ ? Promise.resolve('unavailable') : new Promise(resolve => {
    Alert.alert(labels.title, labels.body, [
      { text: labels.cancel, style: 'cancel', onPress: () => resolve('dismissed') },
      { text: labels.reward, onPress: () => resolve('rewarded') },
    ], { cancelable: true, onDismiss: () => resolve('dismissed') });
  }) };
}
export const ads: AdsService = { showInterstitial: async () => 'unavailable', showRewarded: async () => 'unavailable' };
