import { startPuzzle, submitSelection, selectCard, elapsedTime, produceCompletionResult, type State } from './engine';
import { remainingTime, continueCountdown, endTimeout, checkCountdown, restartAttempt } from './countdown';
import { findPuzzle } from '../content';
import { decodeActiveSession } from '../../state/activeSession';
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
const clock=(n:number)=>({monotonicMs:n,utcMs:n});
const fresh=(position=4)=>startPuzzle(findPuzzle('en-easy')!,{launch:{mode:'level',levelId:'en-easy',locale:'en',puzzleRevision:1},position,seed:1,sessionId:'penalties',clock:clock(0)});
const wrong=(s:State,n:number)=>submitSelection(['c0','c1','c2','c4'].reduce((s,id)=>selectCard(s,id).state,s),clock(n)).state;
test('42 seconds becomes 37; elapsed gameplay excludes penalty time',()=>{
 const initial=fresh(); const s=wrong(initial,18000);
 expect(remainingTime(initial,18000)).toBe(42000);expect(remainingTime(s,18000)).toBe(37000);
 expect(s.penaltyMs).toBe(5000);expect(elapsedTime(s,18000)).toBe(18000);expect(s.order).toEqual(initial.order);expect(s.selected).toEqual([]);
});
test('penalties stack beyond four wrong answers without count-based failure',()=>{
 let s=fresh();for(let i=0;i<6;i++)s=wrong(s,0);
 expect(s.status).toBe('playing');expect(s.timedOut).toBe(false);expect(s.mistakes).toBe(6);expect(remainingTime(s,0)).toBe(30000);
});
test('penalty clamps to remaining time and freezes first timeout without spending continuation',()=>{
 const s=wrong(fresh(),58000);expect(remainingTime(s,58000)).toBe(0);expect(s.penaltyMs).toBe(2000);
 expect(s.timedOut).toBe(true);expect(s.status).toBe('playing');expect(s.continueUsed).toBe(false);expect(s.activeSince).toBeNull();
 expect(restartAttempt(s)).toBe(s);expect(produceCompletionResult(s)).toBeNull();
});
test('extension adds exactly 30 seconds and penalty can trigger final second timeout',()=>{
 let s=continueCountdown(wrong(fresh(),58000),clock(100000));expect(remainingTime(s,100000)).toBe(30000);
 for(let i=0;i<6;i++)s=wrong(s,100000);
 expect(s.status).toBe('lost');expect(s.failureReason).toBe('timeout');expect(continueCountdown(s,clock(100000))).toBe(s);
 expect(produceCompletionResult(s)).toMatchObject({elapsedMs:58000,penaltySeconds:32,rewardedContinueUsed:true,mistakes:7});
});
test.each([1,2,3])('untimed position %i stays untimed despite repeated wrong answers',position=>{
 let s=fresh(position);for(let i=0;i<20;i++)s=wrong(s,100000);
 expect(s.status).toBe('playing');expect(s.mistakes).toBe(20);expect(s.penaltyMs).toBe(0);expect(remainingTime(s,100000)).toBeNull();
});
test('declining penalty timeout ends once and preserves active time',()=>{
 const s=endTimeout(wrong(fresh(),58000),clock(100000));expect(s.status).toBe('lost');expect(s.elapsedMs).toBe(58000);expect(endTimeout(s,clock(200000))).toBe(s);
});
test('natural timeout after a penalty excludes penalty seconds from elapsed result',()=>{
 const s=endTimeout(checkCountdown(wrong(fresh(),0),clock(55000)),clock(90000));expect(s.elapsedMs).toBe(55000);
});
test('restart preserves penalties and extension eligibility',()=>{
 const s=wrong(fresh(),1000); const next=restartAttempt(s);expect(next.penaltyMs).toBe(5000);expect(remainingTime(next,1000)).toBe(54000);expect(next.sessionId).toBe(s.sessionId);
});
test('legacy active saves preserve attempts and do not apply penalties retroactively',()=>{
 const s={...fresh(),mistakes:3,usedHints:['pair0'],elapsedMs:12000,continueUsed:true};delete s.penaltyMs;
 const restored=decodeActiveSession(JSON.stringify({version:1,state:s}))!;
 expect(restored).toMatchObject({mistakes:3,usedHints:['pair0'],elapsedMs:12000,continueUsed:true,penaltyMs:0});expect(restored.order).toEqual(s.order);
});
test('new penalty saves restore counts greater than four and retain timeout state',()=>{
 let s=fresh();for(let i=0;i<12;i++)s=wrong(s,0);
 const restored=decodeActiveSession(JSON.stringify({version:2,state:s}))!;
 expect(restored).toMatchObject({mistakes:12,penaltyMs:60000,timedOut:true,elapsedMs:0});expect(restored.pauses).toContain('timeout');
});
