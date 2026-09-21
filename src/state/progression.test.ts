import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultPlayer, playerReducer } from './player';
import { canStartLevel, nextUnlockedLevel } from './progression';
import { migratePlayer } from './migrations';
import { savePlayer, loadPlayer } from './storage';
import { levelsFor } from '../game/content';
import type { GameResult } from '../game/types';
jest.mock('expo-constants',()=>({__esModule:true,default:{expoConfig:{extra:{appVariant:'tester'}}}}));
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
const level=(n:number)=>levelsFor('fr').find(l=>l.number===n)!;
const win=(n:number):GameResult=>({id:`win-${n}`,sessionId:`s-${n}`,mode:'level',levelId:level(n).id,locale:'fr',puzzleRevision:1,outcome:'won',mistakes:6,hintsUsed:0,elapsedMs:12000,completedAt:'2026-09-21T00:00:00.000Z'});
test('new player unlocks only level 1; future and unavailable IDs are rejected',()=>{
 const s=defaultPlayer();expect(s.highestUnlockedLevel).toEqual({fr:1,en:1,es:1});
 expect(canStartLevel(s,'fr',level(1).id)).toBe(true);expect(canStartLevel(s,'fr',level(2).id)).toBe(false);expect(canStartLevel(s,'fr','missing')).toBe(false);
});
test.each([1,17,34])('winning level %i unlocks exactly its successor',n=>{
 const s=playerReducer({...defaultPlayer(),highestUnlockedLevel:{fr:n,en:1,es:1}},{type:'complete',result:win(n)});
 expect(s.highestUnlockedLevel.fr).toBe(n+1);expect(nextUnlockedLevel(s,'fr',level(n).id)?.number).toBe(n+1);
 expect(canStartLevel(s,'fr',level(n+1).id)).toBe(true);
 if(n<34)expect(canStartLevel(s,'fr',level(n+2).id)).toBe(false);
});
test('replaying older levels cannot lower unlock boundary',()=>{
 let s=playerReducer(defaultPlayer(),{type:'complete',result:win(17)});s=playerReducer(s,{type:'complete',result:win(1)});
 expect(s.highestUnlockedLevel.fr).toBe(18);expect(canStartLevel(s,'fr',level(16).id)).toBe(true);
});
test('completing tester level 35 cannot navigate to unavailable 36',()=>{
 const s=playerReducer(defaultPlayer(),{type:'complete',result:win(35)});
 expect(nextUnlockedLevel(s,'fr',level(35).id)).toBeUndefined();expect(canStartLevel(s,'fr','puzzle-fr-curated-036')).toBe(false);
});
test('version 2 migration uses highest completed position, not completion count, preserving sparse wins and preferences',()=>{
 const old={version:2,completedLevels:[level(2).id,level(21).id],preferences:{language:'es',sound:false,haptics:false},dailyCompletions:{},lastResult:win(21)};
 const s=migratePlayer(JSON.stringify(old)).state;
 expect(s.version).toBe(3);expect(s.highestUnlockedLevel.fr).toBe(22);expect(s.completedLevels).toEqual(old.completedLevels);expect(s.preferences).toEqual(old.preferences);expect(s.lastResult).toEqual(old.lastResult);
});
test('migration without progress unlocks 1; existing higher boundary never regresses',()=>{
 expect(migratePlayer(JSON.stringify({version:2,completedLevels:[]})).state.highestUnlockedLevel.fr).toBe(1);
 const s={...defaultPlayer(),highestUnlockedLevel:{fr:30,en:7,es:2},completedLevels:[level(2).id]};expect(migratePlayer(JSON.stringify(s)).state.highestUnlockedLevel).toEqual(s.highestUnlockedLevel);
});
test('progress persists through storage reload while other save keys remain untouched',async()=>{
 let raw:string|null=null;
 jest.mocked(AsyncStorage.setItem).mockImplementation(async(_key,value)=>{raw=value;});jest.mocked(AsyncStorage.getItem).mockImplementation(async()=>raw);
 const state=playerReducer(defaultPlayer(),{type:'complete',result:win(17)});await savePlayer(state);expect((await loadPlayer()).state).toEqual(state);
 expect(jest.mocked(AsyncStorage.setItem).mock.calls.every(([key])=>key==='tiny-game-starter:player')).toBe(true);
});
test('daily victory and timeout loss do not unlock normal levels',()=>{
 const r=win(17);const failed=playerReducer(defaultPlayer(),{type:'complete',result:{...r,outcome:'lost',failureReason:'timeout'}});
 const daily=playerReducer(defaultPlayer(),{type:'complete',result:{...r,mode:'daily',date:'2026-09-21'}});
 expect(failed.highestUnlockedLevel.fr).toBe(1);expect(daily.highestUnlockedLevel.fr).toBe(1);
});
