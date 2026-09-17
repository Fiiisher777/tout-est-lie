export type PrivacyStatus = {
    analyticsAllowed: boolean;
    canRequestAds: boolean;
    tracking: 'notRequested' | 'allowed' | 'denied';
    privacyOptionsRequired: boolean;
};
export interface PrivacyService {
    getStatus(): PrivacyStatus;
    openOptions(): Promise<'unavailable' | 'shown'>;
}
// A future UMP adapter must refresh consent; saved app preferences are not consent.
export const privacy: PrivacyService = {
    getStatus: () => ({ analyticsAllowed: false, canRequestAds: false, tracking: 'notRequested', privacyOptionsRequired: false }),
    openOptions: async () => 'unavailable',
};
