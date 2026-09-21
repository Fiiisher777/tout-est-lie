import React, { act } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { PuzzleBoard, SolvedArchive } from './components/PuzzleBoard';
import { createCompletionTransition } from './completionTransition';
import { findPuzzle } from './content';
import { startPuzzle, selectCard, submitSelection, produceCompletionResult, type State } from './engine/engine';
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
jest.mock('./components/PuzzleCard',()=>({PuzzleCard:()=>null}));
const {create}=jest.requireActual('react-test-renderer');
const clock={monotonicMs:0,utcMs:0};
const fresh=()=>startPuzzle(findPuzzle('en-easy')!,{launch:{mode:'level',levelId:'en-easy',locale:'en',puzzleRevision:1},seed:1,sessionId:'completion',clock,position:1});
function selectGroup(s:State,index:number){return s.puzzle.groups[index].cardIds.reduce((next,id)=>selectCard(next,id).state,s);}
function finalSelection(){let s=fresh();for(let i=0;i<3;i++)s=submitSelection(selectGroup(s,i),clock).state;return selectGroup(s,3);}
let animationEnd: ((value:{finished:boolean})=>void)|undefined;
let root: ReturnType<typeof create>;
beforeEach(()=>{
 (globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 animationEnd=undefined;
 jest.spyOn(AccessibilityInfo,'isReduceMotionEnabled').mockResolvedValue(false);
 jest.spyOn(Animated,'timing').mockImplementation(()=>({start:callback=>{animationEnd=callback;},stop:jest.fn(),reset:jest.fn()}));
});
afterEach(async()=>{if(root)await act(async()=>root.unmount());root=undefined;jest.restoreAllMocks();});
async function mount(s:State,finish:(sessionId:string)=>void){await act(async()=>{root=create(React.createElement(PuzzleBoard,{state:s,disabled:false,onCard:jest.fn(),onCompletionReady:finish}));});}
async function update(s:State,finish:(sessionId:string)=>void){await act(async()=>{root.update(React.createElement(PuzzleBoard,{state:s,disabled:false,onCard:jest.fn(),onCompletionReady:finish}));});}
test('non-final solved group animates without Results completion',async()=>{
 const before=selectGroup(fresh(),0);const finish=jest.fn();await mount(before,finish);
 const transition=submitSelection(before,clock);await update(transition.state,finish);
 await act(async()=>animationEnd?.({finished:true}));
 expect(produceCompletionResult(transition.state)).toBeNull();expect(finish).not.toHaveBeenCalled();expect(root.root.findAllByType(SolvedArchive)).toHaveLength(1);
});
test('final solve waits for real animation completion and committed fourth archive; duplicate completion is shared',async()=>{
 const gate=createCompletionTransition();const before=finalSelection();const navigate=jest.fn(async()=>{});await mount(before,gate.finish);
 const transition=submitSelection(before,clock);gate.observe(transition);
 const result=produceCompletionResult(transition.state)!;
 const completion=gate.complete(result,navigate);expect(gate.complete(result,navigate)).toBe(completion);
 await update(transition.state,gate.finish);expect(navigate).not.toHaveBeenCalled();expect(root.root.findAllByType(SolvedArchive)).toHaveLength(3);
 // No timer is advanced: the actual Animated completion callback releases navigation.
 await act(async()=>animationEnd?.({finished:true}));await completion;
 expect(root.root.findAllByType(SolvedArchive)).toHaveLength(4);expect(navigate).toHaveBeenCalledTimes(1);
 gate.finish(result.sessionId);await gate.complete(result,navigate);expect(navigate).toHaveBeenCalledTimes(1);
});
test('reduced motion commits final archive and completes without an animation or delay',async()=>{
 jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
 const gate=createCompletionTransition();const before=finalSelection();const navigate=jest.fn(async()=>{});await mount(before,gate.finish);
 const transition=submitSelection(before,clock);gate.observe(transition);const completion=gate.complete(produceCompletionResult(transition.state)!,navigate);
 await update(transition.state,gate.finish);await completion;
 expect(Animated.timing).not.toHaveBeenCalled();expect(root.root.findAllByType(SolvedArchive)).toHaveLength(4);expect(navigate).toHaveBeenCalledTimes(1);
});
test('restored terminal session has no animation to await and failed completion remains retryable',async()=>{
 const gate=createCompletionTransition();const result=produceCompletionResult(submitSelection(finalSelection(),clock).state)!;
 const navigate=jest.fn().mockRejectedValueOnce(new Error('retry')).mockResolvedValue(undefined);
 await expect(gate.complete(result,navigate)).rejects.toThrow('retry');await gate.complete(result,navigate);expect(navigate).toHaveBeenCalledTimes(2);
});
