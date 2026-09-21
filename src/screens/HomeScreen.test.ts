import React, { type ReactElement } from 'react';
import { HomeScreen } from './HomeScreen';
import { HomeNotebook } from '../lore/HomeNotebook';
import { homeAssets, homeCampaign } from './homePresentation';
import { defaultPlayer } from '../state/player';
import { levelsFor } from '../game/content';
jest.mock('expo-constants',()=>({__esModule:true,default:{expoConfig:{extra:{appVariant:'tester'}}}}));
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
let mockPlayer=defaultPlayer();let mockWritable=true;const mockPush=jest.fn();
jest.mock('expo-router',()=>({useRouter:()=>({push:mockPush}),Stack:{Screen:'StackScreen'}}));
jest.mock('../state/PlayerProvider',()=>({usePlayer:()=>({state:mockPlayer,writable:mockWritable})}));
jest.mock('../i18n',()=>({useTranslation:()=>({locale:'fr',t:(key:string)=>key})}));
type Element=ReactElement<{testID?:string;children?:React.ReactNode;disabled?:boolean;onPress?:()=>void;options?:{headerShown:boolean}}>;
function descendants(node:React.ReactNode):Element[]{if(!React.isValidElement(node))return [];const e=node as Element;return [e,...React.Children.toArray(e.props.children).flatMap(descendants)];}
const tree=()=>descendants(HomeScreen());
const find=(id:string)=>tree().find(e=>e.props.testID===id)!;
beforeEach(()=>{mockPlayer=defaultPlayer();mockWritable=true;jest.clearAllMocks();});
test('Home retains wordmark and navigation when artwork is absent',()=>{
 const original={...homeAssets};
 try {
  Object.assign(homeAssets,{logo:null,libraryBackground:null,professorIllustration:null});
  expect(tree().some(e=>e.props.options?.headerShown===false)).toBe(true);
  expect(find('home-logo')).toBeUndefined();expect(find('library-background')).toBeUndefined();expect(find('professor-illustration')).toBeUndefined();
  expect(find('continue-campaign')).toBeDefined();expect(find('settings-action')).toBeDefined();
 } finally {Object.assign(homeAssets,original);}
});
test('approved assets are wired and logo replaces the wordmark',()=>{
 expect(homeAssets.logo).toBeTruthy();expect(homeAssets.libraryBackground).toBeTruthy();expect(homeAssets.professorIllustration).toBeTruthy();
 expect(find('home-logo')).toBeDefined();expect(find('library-background')).toBeDefined();
});
test('new player sees level 1 and Bureau',()=>{
 expect(find('current-level').props.children).toContain('01');expect(find('current-zone').props.children).toBe('LE BUREAU');
});
test('Continue opens highest unlocked playable level directly in tester',()=>{
 mockPlayer.highestUnlockedLevel.fr=17;
 expect(find('current-level').props.children).toContain('17');
 find('continue-campaign').props.onPress!();
 expect(mockPush).toHaveBeenCalledWith({pathname:'/game',params:{mode:'level',levelId:levelsFor('fr').find(l=>l.number===17)!.id}});
});
test('Continue cannot target a locked future level',()=>{
 const campaign=homeCampaign(mockPlayer,'fr');expect(campaign.level?.number).toBe(1);
 find('continue-campaign').props.onPress!();expect(mockPush.mock.calls[0][0].params.levelId).toBe(campaign.level!.id);
});
test('zone comes from progression boundary 10 to 11',()=>{
 mockPlayer.highestUnlockedLevel.fr=10;expect(homeCampaign(mockPlayer,'fr').zone?.name).toBe('Le Bureau');
 mockPlayer.highestUnlockedLevel.fr=11;expect(find('current-zone').props.children).toBe('LES RAYONNAGES');
});
test('level 35 completion offers replay of 35, never unavailable 36',()=>{
 mockPlayer.highestUnlockedLevel.fr=36;mockPlayer.completedLevels=[levelsFor('fr').find(l=>l.number===35)!.id];
 expect(homeCampaign(mockPlayer,'fr').complete).toBe(true);
 find('continue-campaign').props.onPress!();expect(mockPush.mock.calls[0][0].params.levelId).toBe(mockPlayer.completedLevels[0]);
});
test('unwritable storage disables Continue and handler also guards navigation',()=>{
 mockWritable=false;expect(find('continue-campaign').props.disabled).toBe(true);find('continue-campaign').props.onPress!();expect(mockPush).not.toHaveBeenCalled();
});
test('tester Daily remains unavailable instead of fabricating a daily puzzle',()=>{
 expect(find('daily-action')).toBeUndefined();expect(find('daily-section')).toBeUndefined();
});
test('secondary routes retain Levels and Settings',()=>{
 find('levels-action').props.onPress!();find('settings-action').props.onPress!();expect(mockPush.mock.calls).toEqual([['/levels'],['/settings']]);
});

test('Carnet is part of secondary navigation, not an appended card collection',()=>{
 expect(tree().filter(e=>e.type===HomeNotebook)).toHaveLength(1);
});

test('local artwork does not change Continue or secondary navigation',()=>{
 const original={...homeAssets};
 try {
  homeAssets.logo=1;homeAssets.libraryBackground=2;homeAssets.professorIllustration=3;
  expect(find('home-logo')).toBeDefined();expect(find('library-background')).toBeDefined();
  find('continue-campaign').props.onPress!();find('levels-action').props.onPress!();find('settings-action').props.onPress!();
  expect(mockPush.mock.calls).toEqual([[{pathname:'/game',params:{mode:'level',levelId:levelsFor('fr')[0].id}}],['/levels'],['/settings']]);
 } finally {Object.assign(homeAssets,original);}
});
test('Home exposes only bottom Settings and disables any native header action',()=>{
 const nodes=tree();expect(nodes.filter(e=>e.props.testID==='settings-action')).toHaveLength(1);
 const screen=nodes.find(e=>e.props.options)!;
 const options=screen.props.options as {headerShown:boolean;headerRight:()=>null};
 expect(options.headerShown).toBe(false);expect(options.headerRight()).toBeNull();expect(options).not.toHaveProperty('statusBarStyle');
});
