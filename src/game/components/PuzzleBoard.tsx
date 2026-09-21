import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import type { State } from '../engine/engine';
import { AppText } from '../../components/AppText';
import { homeTheme, puzzleTheme as theme } from '../../config/theme';
import { PuzzleCard } from './PuzzleCard';

export function boardChange(previous:State,current:State) {
  if(previous.sessionId!==current.sessionId)return null;
  if(current.solved.length>previous.solved.length)return 'solved';
  if(current.mistakes>previous.mistakes)return 'mistake';
  return null;
}
export function SolvedArchive({label,words}:{label:string;words:readonly string[]}) {
  return <View testID="solved-archive" style={styles.solved} accessible accessibilityLabel={`${label}: ${words.join(', ')}`}>
    <AppText style={styles.category}>{label}</AppText><AppText style={styles.words}>{words.join(' · ')}</AppText>
  </View>;
}
export function PuzzleBoard({state,disabled,onCard,onResolved,onCompletionReady}:{state:State;disabled:boolean;onCard:(id:string)=>void;onResolved?:()=>void;onCompletionReady?:(sessionId:string)=>void}) {
  const previous=useRef(state);const [motion,setMotion]=useState(false);
  const [completedSession,setCompletedSession]=useState<string|null>(null);
  const completionReady=useRef(onCompletionReady);
  useLayoutEffect(()=>{completionReady.current=onCompletionReady;},[onCompletionReady]);
  // Runs after the final archive row has committed, not merely when fading ends.
  useEffect(()=>{if(completedSession)completionReady.current?.(completedSession);},[completedSession]);
  const [fx,setFx]=useState<{kind:'solved'|'mistake';before:State;after:State}|null>(null);
  const [progress]=useState(()=>new Animated.Value(0));const resolved=useRef(onResolved);useEffect(()=>{resolved.current=onResolved;},[onResolved]);
  useEffect(()=>{let active=true;void AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{if(active)setMotion(!reduced);});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',reduced=>setMotion(!reduced));return()=>{active=false;sub.remove();};},[]);
  useLayoutEffect(()=>{
    const before=previous.current;previous.current=state;
    const kind=boardChange(before,state);
    if(kind&&motion){setFx({kind,before,after:state});progress.setValue(0);}
    if(kind==='solved'&&!motion&&state.status==='won')completionReady.current?.(state.sessionId);
    if(before.sessionId!==state.sessionId)setFx(null);
  },[state,motion,progress]);
  useEffect(()=>{
    if(!fx)return;
    const animation=Animated.timing(progress,{toValue:1,duration:motion?(fx.kind==='solved'?340:260):0,useNativeDriver:true});
    animation.start(({finished})=>{if(finished){setFx(null);if(fx.kind==='solved'){resolved.current?.();if(fx.after.status==='won')setCompletedSession(fx.after.sessionId);}}});
    return()=>animation.stop();
  },[fx,motion,progress]);
  const display=fx?.kind==='solved'?fx.before:state;
  const label=(id:string)=>state.puzzle.cards.find(c=>c.id===id)!.text;
  const shake=progress.interpolate({inputRange:[0,0.2,0.4,0.6,0.8,1],outputRange:[0,-3,3,-2,2,0]});
  return <View style={styles.board}>
    {display.solved.map(id=>{const group=state.puzzle.groups.find(g=>g.id===id)!;return <SolvedArchive key={id} label={group.label} words={group.cardIds.map(label)} />;})}
    <View style={styles.grid}>{Array.from({length:Math.ceil(display.order.length/4)},(_,row)=><View key={row} style={styles.row}>
      {display.order.slice(row*4,row*4+4).map((id,column)=>{
        const moving=fx?.before.selected.includes(id);
        const transform=fx?.kind==='mistake'&&moving?[{translateX:shake}]:fx?.kind==='solved'&&moving?[
          {translateX:progress.interpolate({inputRange:[0,1],outputRange:[0,(1.5-column)*6]})},
          {scale:progress.interpolate({inputRange:[0,1],outputRange:[1,0.94]})},
        ]:[];
        return <Animated.View key={id} style={[styles.cell,{transform,opacity:fx?.kind==='solved'&&moving?progress.interpolate({inputRange:[0,0.65,1],outputRange:[1,1,0]}):1}]}>
          <PuzzleCard label={label(id)} selected={display.selected.includes(id)} disabled={disabled||!!fx} onPress={()=>onCard(id)} />
        </Animated.View>;
      })}
    </View>)}</View>
  </View>;
}
const styles=StyleSheet.create({board:{gap:8},grid:{gap:6},row:{flexDirection:'row',gap:6},cell:{flex:1,minWidth:0},solved:{paddingVertical:8,paddingHorizontal:12,borderRadius:theme.radius.card,backgroundColor:theme.successSurface},category:{fontFamily:Platform.OS==='ios'?homeTheme.typography.editorialIOS:homeTheme.typography.editorialAndroid,fontSize:19,lineHeight:23,color:theme.solvedText},words:{fontSize:12,lineHeight:18,color:theme.solvedText}});
