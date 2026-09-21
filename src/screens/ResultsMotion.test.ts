import React, { act } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { ArchiveArrival } from './ResultsScreen';
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
const {create}=jest.requireActual('react-test-renderer');
afterEach(()=>jest.restoreAllMocks());
test.each([true,false])('archive respects reduced motion = %s without gating content',async reduced=>{
 (globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 jest.spyOn(AccessibilityInfo,'isReduceMotionEnabled').mockResolvedValue(reduced);
 const animation=jest.spyOn(Animated,'timing').mockImplementation(()=>({start:jest.fn(),stop:jest.fn(),reset:jest.fn()}));
 let root:ReturnType<typeof create>;
 await act(async()=>{root=create(React.createElement(ArchiveArrival,null,React.createElement('Recap')));});
 expect(root.root.findAllByType('Recap')).toHaveLength(1);
 if(reduced)expect(animation).not.toHaveBeenCalled();else expect(animation).toHaveBeenCalledWith(expect.anything(),expect.objectContaining({duration:220}));
 await act(async()=>root.unmount());
});
