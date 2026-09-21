import React, { type ReactElement } from 'react';
import { HomeScreen } from './HomeScreen';
import { defaultPlayer } from '../state/player';
jest.mock('expo-constants',()=>({__esModule:true,default:{expoConfig:{extra:{appVariant:'development'}}}}));
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
const mockPush=jest.fn();let mockDaily=true;const mockPlayer=defaultPlayer();
jest.mock('expo-router',()=>({useRouter:()=>({push:mockPush}),Stack:{Screen:'StackScreen'}}));
jest.mock('../game/content',()=>({...jest.requireActual('../game/content'),hasDailyContent:()=>mockDaily}));
jest.mock('../state/PlayerProvider',()=>({usePlayer:()=>({state:mockPlayer,writable:true})}));
jest.mock('../i18n',()=>({useTranslation:()=>({locale:'fr',t:(key:string)=>key})}));
type Element=ReactElement<{testID?:string;children?:React.ReactNode;disabled?:boolean;onPress?:()=>void}>;
function descendants(node:React.ReactNode):Element[]{if(!React.isValidElement(node))return [];const e=node as Element;return [e,...React.Children.toArray(e.props.children).flatMap(descendants)];}
test('available Daily uses the existing route',()=>{
 mockDaily=true;const action=descendants(HomeScreen()).find(e=>e.props.testID==='daily-action')!;
 expect(action.props.disabled).toBe(false);action.props.onPress!();expect(mockPush).toHaveBeenCalledWith('/daily');
});
test('missing Daily content disables navigation',()=>{
 mockPush.mockClear();mockDaily=false;const action=descendants(HomeScreen()).find(e=>e.props.testID==='daily-action')!;
 expect(action).toBeUndefined();expect(mockPush).not.toHaveBeenCalled();
});
