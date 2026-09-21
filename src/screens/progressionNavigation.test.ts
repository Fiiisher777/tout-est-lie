import { StyleSheet } from 'react-native';
import React, { type ReactElement } from 'react';
import { GameScreen } from './GameScreen';
import { ResultsScreen } from './ResultsScreen';
import { ArchiveLevel, levelColumns, LevelsScreen } from './LevelsScreen';
import { defaultPlayer, playerReducer } from '../state/player';
import { levelsFor } from '../game/content';
import type { GameResult } from '../game/types';
import { analytics } from '../services/analytics';
jest.mock('expo-constants',()=>({__esModule:true,default:{expoConfig:{extra:{appVariant:'tester'}}}}));
jest.mock('react',()=>({...jest.requireActual('react'),useRef:(current:unknown)=>({current})}));
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
let mockPlayer=defaultPlayer();let mockParams:Record<string,string>={};const mockReplace=jest.fn();const mockPush=jest.fn();
jest.mock('expo-router',()=>({useLocalSearchParams:()=>mockParams,useRouter:()=>({replace:mockReplace,push:mockPush}),Stack:{Screen:'StackScreen'}}));
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

test('archive rows retain completed replay, current level and launch guards',()=>{
 mockPlayer=playerReducer(defaultPlayer(),{type:'complete',result:result(10)});
 const entries=descendants(LevelsScreen()).filter(e=>e.props.locked!==undefined);
 expect(entries).toHaveLength(35);
 expect((entries[9].props as {completed:boolean}).completed).toBe(true);
 expect((entries[10].props as {current:boolean}).current).toBe(true);
 entries[11].props.onPress!();expect(mockPush).not.toHaveBeenCalled();
 entries[9].props.onPress!();expect(mockPush).toHaveBeenCalledWith({pathname:'/game',params:{mode:'level',levelId:level(10).id}});
 expect(mockPlayer.highestUnlockedLevel.fr).toBe(11);
});
test('future zone destinations contain no fabricated level rows',()=>{
 const elements=descendants(LevelsScreen());
 expect(elements.filter(e=>e.props.locked!==undefined)).toHaveLength(35);
 const labels=elements.map(e=>React.Children.toArray(e.props.children).filter(child=>typeof child==='string').join(''));
 expect(labels).toEqual(expect.arrayContaining(['Les Archives','Le Cabinet des Curiosités','La Réserve']));
});

test('catalogue uses two columns on phones and one for large accessibility text',()=>{
 expect(levelColumns(320,1)).toBe(2);expect(levelColumns(430,1)).toBe(2);
 expect(levelColumns(320,1.5)).toBe(1);expect(levelColumns(280,1)).toBe(1);
});
test.each([
 [true,false,false,'level, completed, replay'],
 [false,true,false,'level, currentLevel'],
 [false,false,true,'level, locked'],
])('tile exposes full accessible state without visible repetitive status', (completed,current,locked,label)=>{
 const tile=ArchiveLevel({number:12,completed,current,locked,disabled:locked,onPress:jest.fn()});
 expect(tile.props.accessibilityLabel).toBe(label);expect(tile.props.disabled).toBe(locked);
 const labels=descendants(tile).map(e=>e.props.children).filter(v=>typeof v==='string');
 expect(labels).toEqual(['12']);
});
test('current tile launches the existing game route and level 35 remains the last tile',()=>{
 mockPlayer=playerReducer(defaultPlayer(),{type:'complete',result:result(34)});
 const entries=descendants(LevelsScreen()).filter(e=>e.props.locked!==undefined);
 expect(entries).toHaveLength(35);expect(entries[34].props.disabled).toBe(false);
 entries[34].props.onPress!();expect(mockPush).toHaveBeenCalledWith({pathname:'/game',params:{mode:'level',levelId:level(35).id}});
});

test('zone names appear only once in a compact horizontal selector',()=>{
 const elements=descendants(LevelsScreen());
 const labels=elements.map(e=>e.props.children).filter(v=>typeof v==='string');
 expect(labels.filter(v=>v==='Le Bureau')).toHaveLength(1);
 expect(labels.filter(v=>v==='Les Rayonnages')).toHaveLength(1);
 expect(labels).not.toContain('locked');
 expect(elements.filter(e=>(e.props as {horizontal?:boolean}).horizontal)).toHaveLength(1);
});
test('all level states retain the same surface and tile geometry',()=>{
 const styles=[{completed:true,current:false,locked:false},{completed:false,current:true,locked:false},{completed:false,current:false,locked:true}].map(state=>{
  const tile=ArchiveLevel({number:12,...state,disabled:state.locked,onPress:jest.fn()});
  return StyleSheet.flatten(tile.props.style({pressed:false}));
 });
 for(const style of styles){
  expect(style.minHeight).toBe(48);expect(style.borderWidth).toBe(1);
  expect(style.backgroundColor).toBe(styles[0].backgroundColor);
  expect(style.paddingHorizontal).toBe(styles[0].paddingHorizontal);
  expect(style.borderRadius).toBe(styles[0].borderRadius);
 }
 expect(styles[1].borderColor).not.toBe(styles[0].borderColor);
});
