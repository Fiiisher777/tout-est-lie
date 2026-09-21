import React, { type ReactElement } from 'react';
import { Modal } from 'react-native';
import { LoreOverlay } from './HomeNotebook';
import { eligibleCards } from './content';
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
type Element=ReactElement<{testID?:string;children?:React.ReactNode;title?:string;onPress?:()=>void;onRequestClose?:()=>void}>;
function elements(node:React.ReactNode):Element[]{if(!React.isValidElement(node))return [];const e=node as Element;return [e,...React.Children.toArray(e.props.children).flatMap(elements)];}
function text(node:React.ReactNode):string{if(typeof node==='string')return node;if(!React.isValidElement(node))return '';return React.Children.toArray((node as Element).props.children).map(text).join(' ');}
const card=eligibleCards('fr','tester')[0];
const base={collection:false,savedIds:[] as string[],cards:[card],busy:false,error:false,onSave:jest.fn(),onClose:jest.fn()};
beforeEach(()=>jest.clearAllMocks());
test('dismissed ritual leaves no appended Home content',()=>expect(LoreOverlay(base)).toBeNull());
test('opening ritual is a separate modal with exactly one copy of its body',()=>{
 const result=LoreOverlay({...base,card});expect(result!.type).toBe(Modal);
 expect(text(result).split(card.body)).toHaveLength(2);
 expect(elements(result).some(e=>e.props.testID==='opening-ritual')).toBe(true);
 expect(elements(result).some(e=>e.props.testID==='notebook-collection')).toBe(false);
});
test('unsaved ritual has one Conserver action',()=>{
 const result=LoreOverlay({...base,card});const action=elements(result).find(e=>e.props.testID==='opening-save')!;
 expect(action.props.title).toBe('Conserver');action.props.onPress!();expect(base.onSave).toHaveBeenCalledWith(card.id,true);
});
test('saved ritual shows subtle saved state, no duplicate card or remove action',()=>{
 const result=LoreOverlay({...base,card,collection:true,savedIds:[card.id]});
 expect(text(result).split(card.body)).toHaveLength(2);
 expect(elements(result).some(e=>e.props.testID==='opening-saved')).toBe(true);
 expect(elements(result).some(e=>e.props.testID==='opening-save'||e.props.testID==='notebook-collection')).toBe(false);
 expect(elements(result).some(e=>e.props.title==='Retirer du carnet')).toBe(false);
});
test('Continue and Android back dismiss the ritual',()=>{
 const result=LoreOverlay({...base,card});elements(result).find(e=>e.props.testID==='lore-close')!.props.onPress!();
 (result as Element).props.onRequestClose!();expect(base.onClose).toHaveBeenCalledTimes(2);
});
test('dedicated Carnet shows saved cards only and supports removal',()=>{
 const result=LoreOverlay({...base,collection:true,savedIds:[card.id]});
 expect(elements(result).some(e=>e.props.testID==='opening-ritual')).toBe(false);
 expect(elements(result).some(e=>e.props.testID==='notebook-collection')).toBe(true);
 elements(result).find(e=>e.props.title==='Retirer du carnet')!.props.onPress!();expect(base.onSave).toHaveBeenCalledWith(card.id,false);
});
