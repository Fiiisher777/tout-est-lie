export type SoundCue = 'press' | 'complete';
export interface AudioService {
    play(cue: SoundCue, enabled: boolean): Promise<void>;
    stop(): void;
}
// No audio assets yet. Replace this adapter with expo-audio when sounds are added.
export const audio: AudioService = { play: async (_cue, _enabled) => { }, stop: () => { } };
