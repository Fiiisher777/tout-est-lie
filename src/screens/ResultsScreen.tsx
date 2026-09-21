import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfessorReaction } from '../lore/components';
import { nextUnlockedLevel } from '../state/progression';
import { analytics } from '../services/analytics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '../components/AppText';
import { LifeIndicator } from '../components/LifeIndicator';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
import { useEconomy } from '../economy/useEconomy';
import { economyStore } from '../economy/store';
import { entitlements } from '../services/entitlements';
import { playtest } from '../config/playtest';
import { resultsTheme as theme } from '../config/theme';
import { SolvedArchive } from '../game/components/PuzzleBoard';
import { resultPresentation } from './resultPresentation';
export function ResultsScreen() {
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const router = useRouter(); const { t } = useTranslation(); const { state, writable, issue, retry } = usePlayer();
  const navigating=useRef(false);
  const result = state.lastResult?.id === resultId ? state.lastResult : null;
  const next = result?.mode === 'level' && result.outcome === 'won' ? nextUnlockedLevel(state, result.locale, result.levelId) : undefined;
  const archive=result?resultPresentation(result):null;
  function navigate(action:()=>void){if(navigating.current)return;navigating.current=true;try{action();}catch(error){navigating.current=false;throw error;}}
  function replay(){if(!writable||!result)return;navigate(()=>router.replace({pathname:'/game',params:result.mode==='daily'?{mode:result.mode,levelId:result.levelId,date:result.date}:{mode:result.mode,levelId:result.levelId}}));}
  return <SafeAreaView style={styles.safe}>
    <Stack.Screen options={{headerShown:false}} />
    <ScrollView contentContainerStyle={styles.content}>
      {issue&&<View style={styles.paper}><AppText>{t(issue==='read'?'storageRead':issue==='write'?'storageWrite':issue)}</AppText>{issue!=='futureVersion'&&<ResultAction title={t('retry')} onPress={()=>{void retry();}} />}</View>}
      {!result ? <AppText style={styles.onDark}>{t('noResult')}</AppText> : <>
        <View style={styles.paper}>
          <AppText style={styles.metadata}>{[archive?.zone?.name,archive?.level?t('level',{number:archive.level.number}):t('daily')].filter(Boolean).join(' · ')}</AppText>
          <AppText testID="result-heading" accessibilityRole="header" style={styles.heading}>{t(result.outcome==='won'?'observationArchived':'observationInterrupted')}</AppText>
          <View style={styles.rule} />
          <ProfessorReaction kind={result.outcome==='won'?'victory':'timeout'} seed={result.id} textStyle={styles.reaction} />
          {result.mode==='daily'&&<AppText style={styles.metadata}>{t('dailyDate',{date:result.date})}</AppText>}
          {result.outcome==='lost'&&result.mode==='level'&&<LifeIndicator home />}
        </View>
        {result.outcome==='won'&&<ArchiveArrival key={result.id}>
          <View style={styles.archive}>{archive?.groups.map(group=><SolvedArchive key={group.id} label={group.label} words={group.words} />)}</View>
          {!archive?.groups.length&&<AppText style={styles.onDark}>{t('recapUnavailable')}</AppText>}
        </ArchiveArrival>}
        {result.outcome==='won'&&result.mode==='level'&&!next&&<AppText testID="content-complete" style={styles.onDark}>{t('archiveComplete')}</AppText>}
      </>}
    </ScrollView>
    <View style={styles.actions}>
      {result&&<>
        {next&&<ResultAction primary title={t('next')} disabled={!writable} onPress={()=>{
          if(!writable)return;
          navigate(()=>{analytics.track({name:'next_level_continued',fromLevelId:result.levelId,levelId:next.id,locale:result.locale});router.replace({pathname:'/game',params:{mode:'level',levelId:next.id}});});
        }} />}
        {result.outcome==='lost'?<RetryAction key={result.id} normal={result.mode==='level'} writable={writable} onRetry={replay} />:<ResultAction title={t('replay')} disabled={!writable} onPress={replay} />}
        <ResultAction title={t('levels')} onPress={()=>navigate(()=>router.replace('/levels'))} />
      </>}
      <ResultAction title={t('backHome')} onPress={()=>navigate(()=>router.dismissTo('/'))} />
    </View>
  </SafeAreaView>;
}
export function RetryAction({normal,writable,onRetry}:{normal:boolean;writable:boolean;onRetry:()=>void}) {
  const {t}=useTranslation();const economy=useEconomy(normal);const [busy,setBusy]=useState(false);const requesting=useRef(false);
  const allowed=!normal||!playtest.enabled||entitlements.isPremium||(economy.ready&&!economy.error&&economy.value.lives>0);
  return <ResultAction primary title={t('retry')} disabled={!writable||!allowed||busy} onPress={()=>{
    if(!writable||!allowed||requesting.current)return;
    requesting.current=true;setBusy(true);
    void (normal?economyStore.canStart():Promise.resolve(true)).then(canStart=>{if(canStart)onRetry();}).catch(()=>{/* Existing LifeIndicator exposes economy storage recovery. */}).finally(()=>{requesting.current=false;setBusy(false);});
  }} />;
}
export function ArchiveArrival({children}:{children:ReactNode}) {
  const [opacity]=useState(()=>new Animated.Value(1));
  useEffect(()=>{
    let active=true;let animation:Animated.CompositeAnimation|undefined;
    const finish=()=>{animation?.stop();opacity.setValue(1);};
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{
      if(!active||reduced)return;
      opacity.setValue(0);animation=Animated.timing(opacity,{toValue:1,duration:220,useNativeDriver:true});animation.start();
    }).catch(finish);
    const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',reduced=>{if(reduced)finish();});
    return()=>{active=false;animation?.stop();subscription.remove();};
  },[opacity]);
  return <Animated.View style={{opacity}}>{children}</Animated.View>;
}
function ResultAction({title,onPress,disabled=false,primary=false}:{title:string;onPress:()=>void;disabled?:boolean;primary?:boolean}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.action,primary&&styles.primary,(pressed||disabled)&&styles.dimmed]}>
    <AppText style={[styles.actionText,primary&&styles.primaryText]}>{title}</AppText>
  </Pressable>;
}
const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:theme.background},content:{padding:20,gap:16,width:'100%',maxWidth:560,alignSelf:'center'},
  paper:{backgroundColor:theme.paper,borderRadius:theme.radius,padding:18,gap:10},
  metadata:{color:theme.text,fontSize:12,lineHeight:18,letterSpacing:1,textTransform:'uppercase'},
  heading:{color:theme.text,fontFamily:Platform.OS==='ios'?theme.typography.editorialIOS:theme.typography.editorialAndroid,fontSize:30,lineHeight:36,textTransform:'uppercase'},
  rule:{width:32,height:1,backgroundColor:theme.accent},reaction:{color:theme.text,fontSize:15,lineHeight:23},archive:{gap:8},onDark:{color:theme.onDark,fontSize:15,lineHeight:23},
  actions:{paddingHorizontal:20,paddingTop:8,paddingBottom:8,gap:2,width:'100%',maxWidth:560,alignSelf:'center'},
  action:{minHeight:theme.tapTarget,paddingHorizontal:12,paddingVertical:10,justifyContent:'center',alignItems:'center',borderRadius:theme.radius},primary:{backgroundColor:theme.primary},
  actionText:{fontSize:15,lineHeight:22,color:theme.onDark,fontWeight:'600'},primaryText:{color:theme.text,textTransform:'uppercase',letterSpacing:1},dimmed:{opacity:0.5},
});
