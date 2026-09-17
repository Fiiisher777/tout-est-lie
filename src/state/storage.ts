import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameConfig } from '../config/game';
import { migratePlayer } from './migrations';
import type { PlayerState } from './player';
const key = `${gameConfig.id}:player`;
let queue: Promise<void> = Promise.resolve();
export async function loadPlayer() { return migratePlayer(await AsyncStorage.getItem(key)); }
export function savePlayer(state: PlayerState): Promise<void> {
    const snapshot = JSON.stringify(state);
    const write = queue.catch(() => { }).then(() => AsyncStorage.setItem(key, snapshot));
    queue = write;
    return write;
}
