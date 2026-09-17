export type AnalyticsEvent = {
    name: 'game_started';
    mode: 'level' | 'daily';
    levelId: string;
} | {
    name: 'game_completed';
    mode: 'level' | 'daily';
    levelId: string;
    score: number;
} | {
    name: 'progress_reset';
};
export interface AnalyticsService {
    track(event: AnalyticsEvent): void;
}
// No identifiers, collection, queue, or network requests.
export const analytics: AnalyticsService = { track: (_event) => { } };
