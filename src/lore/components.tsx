import { useCallback, useEffect, useRef, useState } from 'react';
import { View, type StyleProp, type TextStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppText } from '../components/AppText';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
import { levelsFor } from '../game/content';
import type { State } from '../game/engine/engine';
import { currentZone, prototypeLoreAvailable, reaction, type ReactionKind } from './content';
import { loreConfig } from './model';
import { loreStore } from './store';
import { createGameplayReactionGate } from './reactions';
export function ProfessorReaction({ kind, seed, textStyle }: {kind:ReactionKind;seed:string;textStyle?:StyleProp<TextStyle>}) {
  const {locale}=useTranslation();const text=reaction(kind,locale,seed);
  return text?<AppText style={textStyle} variant="muted" numberOfLines={2} accessibilityLabel={text}>{text}</AppText>:null;
}
export function ZoneMoment() {
  const {locale}=useTranslation(); const {state}=usePlayer(); const [line,setLine]=useState<string>();
  const highest=state.highestUnlockedLevel[locale];const available=Math.max(0,...levelsFor(locale).map(l=>l.number));
  const zone=currentZone(highest,available);
  useFocusEffect(useCallback(()=>{
    let active=true;setLine(undefined);
    if(prototypeLoreAvailable(locale))void loreStore.claimZone(locale,highest,available).then(z=>{if(active)setLine(z?.entryLine);}).catch(()=>{});
    return()=>{active=false;};
  },[locale,highest,available]));
  useEffect(()=>{if(!line)return;const timer=setTimeout(()=>setLine(undefined),6000);return()=>clearTimeout(timer);},[line]);
  if(!prototypeLoreAvailable(locale)||!zone)return null;
  return <View><AppText variant="muted">{zone.name}</AppText>{line&&<AppText variant="muted">{line}</AppText>}</View>;
}
export function GameplayFlavor({state,textStyle}:{state:State;textStyle?:StyleProp<TextStyle>}) {
  const {locale}=useTranslation();const gate=useRef(createGameplayReactionGate());const [line,setLine]=useState<string>();
  useEffect(()=>{const kind=gate.current.observe(state,Date.now());if(kind)setLine(reaction(kind,locale,`${state.sessionId}:${state.mistakes}:${state.usedHints.length}`));},[state,locale]);
  useEffect(()=>{if(!line)return;const timer=setTimeout(()=>setLine(undefined),loreConfig.reactionDisplayMs);return()=>clearTimeout(timer);},[line]);
  return prototypeLoreAvailable(locale)&&line?<AppText style={textStyle} variant="muted" numberOfLines={2} accessibilityLabel={line}>{line}</AppText>:null;
}

