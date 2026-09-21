import React, { type ReactElement } from 'react';
import { GameScreen } from './GameScreen';
import { ResultsScreen } from './ResultsScreen';
import { LevelsScreen } from './LevelsScreen';
import { defaultPlayer, playerReducer } from '../state/player';
import { levelsFor } from '../game/content';
import type { GameResult } from '../game/types';
import { analytics } from '../services/analytics';
jest.mock('expo-constants',()=>({__esModule:true,default:{expoConfig:{extra:{appVariant:'tester'}}}}));
jest.mock('react',()=>({...jest.requireActual('react'),useRef:(current:unknown)=>({current})}));
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
let mockPlayer=defaultPlayer();let mockParams:Record<string,string>={};const mockReplace=jest.fn();
jest.mock('expo-router',()=>({useLocalSearchParams:()=>mockParams,useRouter:()=>({replace:mockReplace,push:jest.fn()}),Stack:{Screen:'StackScreen'}}));
jest.mock('../state/PlayerProvider',()=>({usePlayer:()=>({state:mockPlayer,writable:true,update:jest.fn()})}));
jest.mock('../i18n',()=>({useTranslation:()=>({locale:'fr',t:(key:string)=>key})}));
type Element=ReactElement<{title?:string;children?:React.ReactNode;disabled?:boolean;locked?:boolean;onPress?:()=>void;launch?:unknown}>;
function descendants(node:React.ReactNode):Element[]{
 if(!React.isValidElement(node))return [];
 const element=node as Element;return [element,...React.Children.toArray(element.props.children).flatMap(descendants)];
}
const level=(n:number)=>levelsFor('fr').find(l=>l.number===n)!;
const result=(n:number):GameResult=>({mode:'level',levelId:level(n).id,locale:'fr',puzzleRevision:1,id:'win',sessionId:'s',outcome:'won',mistakes:7,hintsUsed:0,elapsedMs:1000,completedAt:'2026-09-21T00:00:00Z'});
beforeEach(()=>{mockPlayer=defaultPlayer();mockParams={};jest.clearAllMocks();});
test('actual GameScreen rejects locked direct level links',()=>{
 mockParams={mode:'level',levelId:level(2).id};expect(descendants(GameScreen()).some(e=>e.props.launch)).toBe(false);
 mockParams={mode:'level',levelId:level(1).id};expect(descendants(GameScreen()).some(e=>e.props.launch)).toBe(true);
});
test('level list shows every level but disables future entries',()=>{
 const entries=descendants(LevelsScreen()).filter(e=>e.props.locked!==undefined);
 expect(entries).toHaveLength(35);expect(entries[0].props.disabled).toBe(false);expect(entries.slice(1).every(e=>e.props.locked&&e.props.disabled)).toBe(true);
});
test('victory primary action navigates directly to next unlocked level and tracks continuation',()=>{
 mockPlayer=playerReducer(defaultPlayer(),{type:'complete',result:result(1)});mockParams={resultId:'win'};
 const track=jest.spyOn(analytics,'track');const buttons=descendants(ResultsScreen()).filter(e=>e.props.onPress);
 expect(buttons[0].props.title).toBe('next');buttons[0].props.onPress!();
 expect(mockReplace).toHaveBeenCalledWith({pathname:'/game',params:{mode:'level',levelId:level(2).id}});
 expect(track).toHaveBeenCalledWith({name:'next_level_continued',fromLevelId:level(1).id,levelId:level(2).id,locale:'fr'});track.mockRestore();
});
test('final available level offers no Next action',()=>{
 mockPlayer=playerReducer(defaultPlayer(),{type:'complete',result:result(35)});mockParams={resultId:'win'};
 expect(descendants(ResultsScreen()).some(e=>e.props.title==='next')).toBe(false);
});
