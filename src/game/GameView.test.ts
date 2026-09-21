import React, { type ReactElement } from 'react';
import { GameView, Feedback } from './GameView';
import { PuzzleBoard, SolvedArchive, boardChange } from './components/PuzzleBoard';
import { HintSheet } from './components/HintSheet';
import { LifeIndicator } from '../components/LifeIndicator';
import { startPuzzle, selectCard, submitSelection, type State, type Transition } from './engine/engine';
import { remainingTime as mockRemainingTime, continueCountdown, endTimeout } from './engine/countdown';
import { findPuzzle } from './content';
import { playtest } from '../config/playtest';
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
const mockSet=jest.fn();
jest.mock('react',()=>({...jest.requireActual('react'),useState:(v:unknown)=>[typeof v==='function'?v():v,mockSet],useRef:(v:unknown)=>({current:v}),useEffect:jest.fn(),useLayoutEffect:jest.fn()}));
jest.mock('expo-router',()=>({useRouter:()=>({push:jest.fn(),replace:jest.fn(),canGoBack:()=>true,back:jest.fn()})}));
jest.mock('../state/PlayerProvider',()=>({usePlayer:()=>({state:{preferences:{haptics:false,sound:false}}})}));
jest.mock('../i18n',()=>({useTranslation:()=>({locale:'en',t:(k:string,v?:{seconds?:number})=>k==='wrongPenalty'?`−${v?.seconds} s`:k})}));
let mockState:State;let mockFeedback:string|null=null;const mockHint=jest.fn();const mockContinue=jest.fn();
jest.mock('./usePuzzleSession',()=>({clock:()=>({monotonicMs:0,utcMs:0}),usePuzzleSession:()=>({state:mockState,remaining:mockRemainingTime(mockState,0),ready:true,requestHint:mockHint,requestContinue:mockContinue,declineContinue:jest.fn(),feedback:mockFeedback,
 act:(fn:(s:State)=>Transition)=>{const next=fn(mockState);mockState=next.state;if(next.outcome==='mistake'||next.outcome==='solved')mockFeedback=next.outcome;},save:jest.fn(),restart:jest.fn()})}));
const fresh=(position=4)=>startPuzzle(findPuzzle('en-easy')!,{launch:{mode:'level',levelId:'en-easy',locale:'en',puzzleRevision:1},position,seed:1,sessionId:'visual',clock:{monotonicMs:0,utcMs:0}});
type E=ReactElement<{children?:React.ReactNode;title?:string;testID?:string;disabled?:boolean;onPress?:()=>void;onCard?:(id:string)=>void;onChoose?:(kind:'pair'|'category')=>void;message?:string;penalty?:boolean;visible?:boolean}>;
function nodes(node:React.ReactNode):E[]{if(!React.isValidElement(node))return [];const e=node as E;return [e,...React.Children.toArray(e.props.children).flatMap(nodes)];}
const tree=()=>nodes(GameView({launch:mockState.launch,onComplete:async()=>{}}));
const action=(title:string)=>tree().find(e=>e.props.title===title)!;
beforeEach(()=>{mockState=fresh();mockFeedback=null;jest.clearAllMocks();});
test('active play has no lives indicator and timed play has timer',()=>{expect(tree().some(e=>e.type===LifeIndicator)).toBe(false);expect(tree().some(e=>e.props.testID==='game-timer')).toBe(true);});
test.each([1,2,3])('untimed position %i has no timer placeholder',n=>{mockState=fresh(n);expect(tree().some(e=>e.props.testID==='game-timer')).toBe(false);});
test('fourth selection does not auto-submit; explicit Validate enables only at four',()=>{
 const group=mockState.puzzle.groups[0];
 for(const id of group.cardIds){expect(action('submit').props.disabled).toBe(true);tree().find(e=>e.type===PuzzleBoard)!.props.onCard!(id);}
 expect(action('submit').props.disabled).toBe(false);expect(mockState.solved).toHaveLength(0);
 action('submit').props.onPress!();expect(mockState.solved).toHaveLength(1);expect(mockState.selected).toHaveLength(0);
});
test('wrong Validate keeps engine penalty and shows brief adjacent feedback',()=>{
 const before=mockRemainingTime(mockState,0)!;
 for(const id of ['c0','c1','c2','c4'])mockState=selectCard(mockState,id).state;
 action('submit').props.onPress!();expect(mockRemainingTime(mockState,0)).toBe(before-playtest.wrongAnswerPenaltySeconds*1000);
 expect(mockState.status).toBe('playing');expect(mockState.selected).toEqual([]);
 expect(tree().find(e=>e.type===Feedback&&e.props.penalty)?.props.message).toBe('−5 s');
});
test('untimed wrong answer has normal feedback without penalty',()=>{
 mockState=fresh(1);for(const id of ['c0','c1','c2','c4'])mockState=selectCard(mockState,id).state;
 action('submit').props.onPress!();expect(mockRemainingTime(mockState,0)).toBeNull();expect(tree().some(e=>e.props.penalty)).toBe(false);
});
test('Indice opens choices and forwards selected kind through existing request',()=>{
 action('hint').props.onPress!();expect(mockSet).toHaveBeenCalledWith(true);
 tree().find(e=>e.type===HintSheet)!.props.onChoose!('category');expect(mockHint).toHaveBeenCalledWith('category');
 const choose=jest.fn();const sheet=nodes(HintSheet({visible:true,available:['pair','category'],onChoose:choose,onClose:jest.fn()}));
 sheet.find(e=>e.props.testID==='hint-pair')!.props.onPress!();sheet.find(e=>e.props.testID==='hint-category')!.props.onPress!();expect(choose.mock.calls).toEqual([['pair'],['category']]);
});
test('ineligible hint kind remains disabled',()=>{const sheet=nodes(HintSheet({visible:true,available:['pair'],onChoose:jest.fn(),onClose:jest.fn()}));expect(sheet.find(e=>e.props.testID==='hint-category')!.props.disabled).toBe(true);});
test('solved archive precedes remaining grid in solve order',()=>{
 for(const group of mockState.puzzle.groups.slice(0,2)){for(const id of group.cardIds)mockState=selectCard(mockState,id).state;mockState=submitSelection(mockState,{monotonicMs:0,utcMs:0}).state;}
 const board=nodes(PuzzleBoard({state:mockState,disabled:false,onCard:jest.fn()}));const archive=board.filter(e=>e.type===SolvedArchive);
 expect(archive).toHaveLength(2);expect(board.indexOf(archive[0])).toBeLessThan(board.indexOf(archive[1]));
 expect(nodes(SolvedArchive({label:'Category',words:['A','B','C','D']}))[0].props.testID).toBe('solved-archive');
});
test('animation observation never mutates engine state or treats restored state as new solve',()=>{
 const before=JSON.stringify(mockState);expect(boardChange(mockState,mockState)).toBeNull();expect(boardChange(mockState,{...mockState,sessionId:'restored',mistakes:1})).toBeNull();expect(JSON.stringify(mockState)).toBe(before);
});
test('timeout still offers existing continue and extension still grants 30 seconds once',()=>{
 mockState={...mockState,timedOut:true,pauses:['timeout'],activeSince:null,elapsedMs:60000};
 action('rewardContinue').props.onPress!();expect(mockContinue).toHaveBeenCalled();
 mockState=continueCountdown(mockState,{monotonicMs:0,utcMs:0});expect(mockRemainingTime(mockState,0)).toBe(30000);expect(mockState.continueUsed).toBe(true);
 expect(continueCountdown(mockState,{monotonicMs:0,utcMs:0})).toBe(mockState);
 const failed=endTimeout({...mockState,timedOut:true},{monotonicMs:0,utcMs:0});expect(failed.status).toBe('lost');
});
