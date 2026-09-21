import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveActiveSession, loadActiveSession } from './activeSession';
import { initialEconomy } from '../economy/model';
import { findPuzzle } from '../game/content';
import { startPuzzle, selectCard, submitSelection, type State } from '../game/engine/engine';
import { checkCountdown, endTimeout } from '../game/engine/countdown';
const mockDisk = new Map<string,string>();
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{
  getItem:jest.fn(async(key:string)=>mockDisk.get(key)??null),
  setItem:jest.fn(async(key:string,value:string)=>{mockDisk.set(key,value);}),
  removeItem:jest.fn(async(key:string)=>{mockDisk.delete(key);}),
}}));
const fresh=(id:string)=>startPuzzle(findPuzzle('en-easy')!,{launch:{mode:'level',levelId:'en-easy',locale:'en',puzzleRevision:1},sessionId:id,seed:1,clock:{monotonicMs:0,utcMs:0},position:4});
const submit=(s:State,ids:string[])=>{ for(const id of ids)s=selectCard(s,id).state;return submitSelection(s,{monotonicMs:100,utcMs:100}).state; };
test('winning and incorrect submissions never debit lives; final loss debits exactly once',async()=>{
  mockDisk.set('tiny-game-starter:economy',JSON.stringify(initialEconomy()));
  let wrong=submit(fresh('wrong'),['c0','c1','c2','c4']);await saveActiveSession(wrong,100);
  expect(JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives).toBe(5);
  let won=fresh('won');for(const g of won.puzzle.groups)won=submit(won,g.cardIds);await saveActiveSession(won,100);
  expect(JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives).toBe(5);
  for(let i=0;i<3;i++)wrong=submit(wrong,['c0','c1','c2','c4']);
  await saveActiveSession(wrong,100); expect(JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives).toBe(5);
  wrong=endTimeout(checkCountdown(wrong,{monotonicMs:60000,utcMs:60000}),{monotonicMs:60000,utcMs:60000});
  await saveActiveSession(wrong,100);await saveActiveSession(wrong,100);
  expect(JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives).toBe(4);
});
test('timeout decision persists frozen across reload without spending a life until declined',async()=>{
  const timed=checkCountdown(fresh('timeout'),{monotonicMs:60000,utcMs:60000});await saveActiveSession(timed,60000);
  const restored=(await loadActiveSession())!;expect(restored.timedOut).toBe(true);expect(restored.pauses).toEqual(['timeout']);
  const before=JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives;
  await saveActiveSession(endTimeout(restored,{monotonicMs:70000,utcMs:70000}),70000);
  expect(JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives).toBe(before-1);
});
test('failed removal leaves terminal journal recoverable without another debit',async()=>{
  const failed=endTimeout(checkCountdown(fresh('journal'),{monotonicMs:60000,utcMs:60000}),{monotonicMs:70000,utcMs:70000});
  jest.mocked(AsyncStorage.removeItem).mockRejectedValueOnce(new Error('disk'));
  await expect(saveActiveSession(failed,70000)).rejects.toThrow('disk');
  const charged=JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives;
  expect((await loadActiveSession())?.status).toBe('lost');await saveActiveSession(failed,70000);
  expect(JSON.parse(mockDisk.get('tiny-game-starter:economy')!).lives).toBe(charged);expect(await loadActiveSession()).toBeNull();
});
