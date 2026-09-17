export type AdOutcome = 'unavailable' | 'dismissed' | 'rewarded';
export interface AdsService {
    showInterstitial(): Promise<AdOutcome>;
    showRewarded(): Promise<AdOutcome>;
}
// No ad SDK, requests, or implicit rewards in the starter.
export const ads: AdsService = {
    showInterstitial: async () => 'unavailable', showRewarded: async () => 'unavailable',
};
