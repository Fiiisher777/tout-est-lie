import { Children, useRef, type ReactNode } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { canStartLevel } from '../state/progression';
import { LifeIndicator } from '../components/LifeIndicator';
import { AppText } from '../components/AppText';
import { levelsFor } from '../game/content';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
import { currentZone, zones } from '../lore/content';
import { homeTheme, nodiColors } from '../config/theme';

export function LevelsScreen() {
  const router = useRouter(); const { t, locale } = useTranslation(); const { state, writable, issue, retry } = usePlayer();
  const scroll = useRef<ScrollView>(null); const offsets = useRef<Record<string, number>>({});
  const levels = levelsFor(locale);
  const current = levels.filter(level => canStartLevel(state, locale, level.id)).at(-1);
  const zone = currentZone(state.highestUnlockedLevel[locale], levels.at(-1)?.number ?? 0);
  const completed = levels.filter(level => state.completedLevels.includes(level.id)).length;
  return <SafeAreaView style={styles.safe}>
    <Stack.Screen options={{headerShown:false}} />
    <ScrollView ref={scroll} contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={()=>router.back()} style={styles.back}><AppText style={styles.text}>‹  {t('back')}</AppText></Pressable>
      <AppText accessibilityRole="header" style={styles.title}>{t('levels')}</AppText>
      <AppText style={styles.secondary}>{t('observationsRecorded',{count:completed})}</AppText>
      <LifeIndicator home />
      {issue&&<View accessibilityLiveRegion="polite"><AppText>{t(issue==='read'?'storageRead':issue==='write'?'storageWrite':issue)}</AppText>{issue!=='futureVersion'&&<Pressable accessibilityRole="button" onPress={()=>{void retry();}} style={styles.back}><AppText>{t('retry')}</AppText></Pressable>}</View>}
      {!levels.length&&<AppText style={styles.secondary}>{t('contentUnavailable')}</AppText>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selector}>
        {zones.map(section=>{
          const available=levels.some(level=>level.number>=section.first&&level.number<=section.last);
          return <Pressable key={section.id} accessibilityRole="button" accessibilityLabel={`${locale==='fr'?section.name:`${section.first}–${section.last}`}${!available?`, ${t('locked')}`:''}`} accessibilityState={{disabled:!available}} disabled={!available} onPress={()=>scroll.current?.scrollTo({y:offsets.current[section.id]??0,animated:false})} style={[styles.zoneLink,zone?.id===section.id&&styles.activeZone]}>
            <AppText style={styles.text}>{locale==='fr'?section.name:`${section.first}–${section.last}`}</AppText>{!available&&<SymbolView accessible={false} name={{ios:'lock',android:'lock'}} tintColor={nodiColors.walnut} size={14} />}
          </Pressable>;
        })}
      </ScrollView>
      {zones.map(section=>{
        const entries=levels.filter(level=>level.number>=section.first&&level.number<=section.last);
        if(!entries.length)return null;

        return <View key={section.id} onLayout={event=>{offsets.current[section.id]=event.nativeEvent.layout.y;}} style={styles.section}>
          <AppText accessibilityRole="header" style={styles.secondary}>{t('levels')} {section.first}–{section.last}</AppText>
          <LevelGrid>
          {entries.map(level=>{
            const locked=!canStartLevel(state,locale,level.id); const done=state.completedLevels.includes(level.id);
            return <ArchiveLevel key={level.id} number={level.number} completed={done} current={!done&&current?.id===level.id} locked={locked} disabled={!writable||locked} onPress={()=>{
              if(writable&&canStartLevel(state,locale,level.id))router.push({pathname:'/game',params:{mode:'level',levelId:level.id}});
            }} />;
          })}</LevelGrid>
        </View>;
      })}
    </ScrollView>
  </SafeAreaView>;
}
export function levelColumns(width:number,fontScale:number) { return (Math.min(width,600)-40)/fontScale<280?1:2; }
function LevelGrid({children}:{children:ReactNode}) {
  const {width,fontScale}=useWindowDimensions();const columns=levelColumns(width,fontScale);
  return <View style={styles.grid}>{Children.map(children,child=><View style={{width:columns===2?'48%':'100%'}}>{child}</View>)}</View>;
}
export function ArchiveLevel({number,completed,current,locked,disabled,onPress}:{number:number;completed:boolean;current:boolean;locked:boolean;disabled:boolean;onPress:()=>void}) {
  const {t}=useTranslation(); const status=t(locked?'locked':completed?'completed':current?'currentLevel':'available');
  const label=`${t('level',{number})}, ${status}${completed&&!locked?`, ${t('replay')}`:''}`;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.row,current&&styles.current,locked&&styles.locked,pressed&&styles.pressed]}>
    <AppText style={[styles.number,locked&&styles.mutedNumber]}>{String(number).padStart(2,'0')}</AppText>
    <SymbolView accessible={false} name={locked?{ios:'lock',android:'lock'}:completed?{ios:'checkmark',android:'check'}:{ios:'play.fill',android:'play_arrow'}} tintColor={completed&&!locked?nodiColors.sage:nodiColors.walnut} size={18} />
  </Pressable>;
}
const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:nodiColors.paper},content:{padding:20,gap:12,width:'100%',maxWidth:600,alignSelf:'center'},
  text:{color:nodiColors.ink},back:{minHeight:48,justifyContent:'center',alignSelf:'flex-start',paddingRight:20},
  title:{color:nodiColors.ink,fontSize:30,lineHeight:38,textTransform:'uppercase',fontFamily:Platform.OS==='ios'?homeTheme.typography.editorialIOS:homeTheme.typography.editorialAndroid},
  secondary:{color:nodiColors.walnut,fontSize:14,lineHeight:21},selector:{gap:16},
  zoneLink:{minHeight:48,flexDirection:'row',alignItems:'center',gap:6,paddingVertical:10,borderBottomWidth:1,borderBottomColor:nodiColors.paper},activeZone:{borderBottomColor:nodiColors.brass},section:{gap:8,marginTop:12},
  grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:8},
  row:{minHeight:48,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8,paddingHorizontal:12,paddingVertical:6,backgroundColor:nodiColors.ivory,borderRadius:10,borderWidth:1,borderColor:nodiColors.ivory},
  current:{borderColor:nodiColors.brass},number:{color:nodiColors.ink,fontSize:19,fontWeight:'600',minWidth:32},
  locked:{backgroundColor:nodiColors.ivory,opacity:0.75},mutedNumber:{color:nodiColors.walnut},pressed:{opacity:0.7},
});
