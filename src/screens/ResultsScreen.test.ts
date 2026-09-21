import React, { type ReactElement } from 'react';
import { ResultsScreen, RetryAction } from './ResultsScreen';
import { resultPresentation } from './resultPresentation';
import { defaultPlayer, playerReducer } from '../state/player';
import { levelsFor } from '../game/content';
import { SolvedArchive } from '../game/components/PuzzleBoard';
import { ProfessorReaction } from '../lore/components';
import { reaction } from '../lore/content';
import { analytics } from '../services/analytics';
import type { GameResult } from '../game/types';
jest.mock('expo-constants',()=>({__esModule:true,default:{expoConfig:{extra:{appVariant:'tester'}}}}));
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
jest.mock('react',()=>({...jest.requireActual('react'),useRef:(v:unknown)=>({current:v}),useState:(v:unknown)=>[typeof v==='function'?v():v,jest.fn()],useEffect:jest.fn()}));
let mockPlayer=defaultPlayer();let mockWritable=true;let mockLives=4;const mockReplace=jest.fn();const mockHome=jest.fn();const mockCanStart=jest.fn(async()=>true);
jest.mock('expo-router',()=>({useLocalSearchParams:()=>({resultId:'result'}),useRouter:()=>({replace:mockReplace,dismissTo:mockHome}),Stack:{Screen:'StackScreen'}}));
jest.mock('../state/PlayerProvider',()=>({usePlayer:()=>({state:mockPlayer,writable:mockWritable,issue:null})}));
jest.mock('../economy/useEconomy',()=>({useEconomy:()=>({ready:true,error:false,value:{lives:mockLives,regenAt:null},now:0})}));
jest.mock('../economy/store',()=>({economyStore:{canStart:()=>mockCanStart()}}));
jest.mock('../i18n',()=>({useTranslation:()=>({locale:'fr',t:(key:string)=>key})}));
const level=(n:number)=>levelsFor('fr').find(l=>l.number===n)!;
const result=(n=1,outcome:'won'|'lost'='won'):GameResult=>({id:'result',sessionId:'attempt',levelId:level(n).id,locale:'fr',puzzleRevision:1,mode:'level',outcome,mistakes:3,hintsUsed:1,elapsedMs:22000,completedAt:'2026-09-21T00:00:00Z'});
type E=ReactElement<{children?:React.ReactNode;title?:string;testID?:string;kind?:string;disabled?:boolean;onPress?:()=>void;onRetry?:()=>void}>;
function nodes(node:React.ReactNode):E[]{if(!React.isValidElement(node))return [];const e=node as E;return[e,...React.Children.toArray(e.props.children).flatMap(nodes)];}
const tree=()=>nodes(ResultsScreen());
const action=(title:string)=>tree().find(e=>e.props.title===title)!;
beforeEach(()=>{mockPlayer=playerReducer(defaultPlayer(),{type:'complete',result:result()});mockWritable=true;mockLives=4;jest.clearAllMocks();mockCanStart.mockResolvedValue(true);});
test('success renders archival heading, exactly four shared rows and one authored reaction',()=>{
 const elements=tree();expect(elements.find(e=>e.props.testID==='result-heading')?.props.children).toBe('observationArchived');
 expect(elements.filter(e=>e.type===SolvedArchive)).toHaveLength(4);
 expect(elements.filter(e=>e.type===ProfessorReaction)).toHaveLength(1);expect(elements.find(e=>e.type===ProfessorReaction)?.props.kind).toBe('victory');
 expect(reaction('victory','fr','result','tester')).toBeTruthy();expect(reaction('victory','en','result','tester')).toBeUndefined();
 expect(JSON.stringify(elements.map(e=>e.props.children).filter(v=>typeof v==='string'))).not.toMatch(/resultStats|XP|score|stars/);
});
test('Next opens the already unlocked level with one existing analytics event even on double tap',()=>{
 const track=jest.spyOn(analytics,'track');const next=action('next');next.props.onPress!();next.props.onPress!();
 expect(mockReplace.mock.calls).toEqual([[{pathname:'/game',params:{mode:'level',levelId:level(2).id}}]]);
 expect(track).toHaveBeenCalledTimes(1);expect(track).toHaveBeenCalledWith({name:'next_level_continued',fromLevelId:level(1).id,levelId:level(2).id,locale:'fr'});track.mockRestore();
});
test('level 35 has safe replay/levels/home fallback and no level 36',()=>{
 mockPlayer=playerReducer(defaultPlayer(),{type:'complete',result:result(35)});
 expect(action('next')).toBeUndefined();expect(tree().find(e=>e.props.testID==='content-complete')).toBeDefined();
 expect(action('replay')).toBeDefined();expect(action('levels')).toBeDefined();expect(action('backHome')).toBeDefined();
});
test('Replay uses existing route and never lowers progression',()=>{
 mockPlayer.highestUnlockedLevel.fr=20;const before=JSON.stringify(mockPlayer);action('replay').props.onPress!();
 expect(mockReplace).toHaveBeenCalledWith({pathname:'/game',params:{mode:'level',levelId:level(1).id}});expect(JSON.stringify(mockPlayer)).toBe(before);
});
test('Levels retains its route',()=>{action('levels').props.onPress!();expect(mockReplace).toHaveBeenCalledWith('/levels');});
test('final failure is minimal with one safe timeout reaction and no solved answers',()=>{
 mockPlayer=playerReducer(defaultPlayer(),{type:'complete',result:result(1,'lost')});
 expect(tree().find(e=>e.props.testID==='result-heading')?.props.children).toBe('observationInterrupted');
 expect(tree().filter(e=>e.type===SolvedArchive)).toHaveLength(0);expect(tree().filter(e=>e.type===ProfessorReaction)).toHaveLength(1);
 expect(tree().find(e=>e.type===ProfessorReaction)?.props.kind).toBe('timeout');expect(reaction('timeout','es','result','tester')).toBeUndefined();expect(action('next')).toBeUndefined();
});
test('Retry checks current life eligibility and ignores duplicate taps',async()=>{
 const retry=jest.fn();const button=RetryAction({normal:true,writable:true,onRetry:retry}) as E;
 expect(button.props.disabled).toBe(false);button.props.onPress!();button.props.onPress!();await Promise.resolve();await Promise.resolve();
 expect(mockCanStart).toHaveBeenCalledTimes(1);expect(retry).toHaveBeenCalledTimes(1);
});
test('zero-life Retry is disabled and cannot bypass gating through its handler',()=>{
 mockLives=0;const retry=jest.fn();const button=RetryAction({normal:true,writable:true,onRetry:retry}) as E;
 expect(button.props.disabled).toBe(true);button.props.onPress!();expect(retry).not.toHaveBeenCalled();expect(mockCanStart).not.toHaveBeenCalled();
});
test('Retry respects the asynchronous guard when lives change after rendering',async()=>{
 mockCanStart.mockResolvedValue(false);const retry=jest.fn();(RetryAction({normal:true,writable:true,onRetry:retry}) as E).props.onPress!();await Promise.resolve();await Promise.resolve();expect(retry).not.toHaveBeenCalled();
});
test('stale puzzle revision does not fabricate a recap from current content',()=>{expect(resultPresentation({...result(),puzzleRevision:999}).groups).toEqual([]);});
test('no terminal record produces no failure/retry surface',()=>{mockPlayer=defaultPlayer();expect(tree().some(e=>e.type===RetryAction)).toBe(false);expect(action('next')).toBeUndefined();});
test('unwritable save prevents Next and Replay navigation',()=>{mockWritable=false;action('next').props.onPress!();action('replay').props.onPress!();expect(mockReplace).not.toHaveBeenCalled();});
