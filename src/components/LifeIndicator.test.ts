import React, { type ReactElement } from 'react';
import { LifeIndicator } from './LifeIndicator';
import { AppText } from './AppText';
jest.mock('react',()=>({...jest.requireActual('react'),useState:(value:unknown)=>[value,jest.fn()]}));
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
let mockRegen:number|null=1800000;
jest.mock('../economy/useEconomy',()=>({useEconomy:()=>({value:{lives:4,regenAt:mockRegen},ready:true,error:null,now:36000})}));
jest.mock('../i18n',()=>({useTranslation:()=>({t:(key:string,args?:{time?:string})=>key==='nextLifeCompact'?`+1 dans ${args?.time}`:key,locale:'fr'})}));
type Element=ReactElement<{children?:React.ReactNode;accessibilityLabel?:string}>;
function elements(node:React.ReactNode):Element[]{if(!React.isValidElement(node))return [];const e=node as Element;return [e,...React.Children.toArray(e.props.children).flatMap(elements)];}
test('Home puts lives and regen in one accessible text element',()=>{
 mockRegen=1800000;const labels=elements(LifeIndicator({home:true})).filter(e=>e.type===AppText);
 expect(labels).toHaveLength(1);expect(labels[0].props.children).toContain('♥ 4/5');expect(labels[0].props.children).toContain('  ·  +1 dans 29:24');expect(labels[0].props.accessibilityLabel).toContain('nextLife');
});
test('Home omits regen when there is no pending regeneration',()=>{
 mockRegen=null;const labels=elements(LifeIndicator({home:true})).filter(e=>e.type===AppText);
 expect(labels).toHaveLength(1);expect(labels[0].props.accessibilityLabel).not.toContain('nextLife');
});
