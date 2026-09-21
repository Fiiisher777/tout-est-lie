import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { HomeNotebook } from '../lore/HomeNotebook';
import { dailyLore, prototypeLoreAvailable } from '../lore/content';
import { canStartLevel } from '../state/progression';
import { isTester } from '../config/environment';
import { LifeIndicator } from '../components/LifeIndicator';
import { hasDailyContent } from '../game/content';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
import { homeTheme as palette } from '../config/theme';
import { homeAssets, homeCampaign, homeCopy } from './homePresentation';
import { HomeProfessor } from './HomeArtwork';

export function HomeScreen() {
  const router = useRouter(); const { t, locale } = useTranslation();
  const { state, writable, issue, retry } = usePlayer();
  const {level, zone, complete} = homeCampaign(state,locale); const copy=homeCopy[locale];
  const dailyAvailable = !isTester && hasDailyContent(locale);
  return <View style={styles.root}>
    <Stack.Screen options={{headerShown:false,headerRight:()=>null}} />
    {homeAssets.libraryBackground && <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Image testID="library-background" source={homeAssets.libraryBackground} resizeMode="cover" style={StyleSheet.absoluteFill} accessible={false} /></View>}
    <View pointerEvents="none" style={[StyleSheet.absoluteFill,styles.overlay]} />
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.identity}>
          {isTester && <Text style={styles.beta}>BETA</Text>}
          {homeAssets.logo ? <View style={styles.logo}><Image testID="home-logo" source={homeAssets.logo} resizeMode="contain" accessibilityRole="image" accessibilityLabel="NODI" style={styles.logoImage} /></View>
            : <Text accessibilityRole="header" style={styles.wordmark}>{t('productName')}</Text>}
          <Text style={styles.tagline}>{t('tagline')}</Text>
          <View style={styles.rule} />
        </View>
        {issue && <View style={styles.panel} accessibilityLiveRegion="polite">
          <Text style={styles.body}>{t(issue === 'read' ? 'storageRead' : issue === 'write' ? 'storageWrite' : issue)}</Text>
          {issue !== 'futureVersion' && <HomeAction label={t('retry')} onPress={()=>{void retry();}} />}
        </View>}
        <View style={styles.campaign}>
          <View style={styles.metadata}>
          {locale === 'fr' && zone && <Text testID="current-zone" style={styles.eyebrow}>{zone.name.toLocaleUpperCase('fr')}</Text>}
          {locale === 'fr' && zone && level && <Text style={styles.eyebrow} accessibilityElementsHidden>·</Text>}
          {level ? <Text testID="current-level" style={styles.eyebrow}>{copy.level.toLocaleUpperCase(locale)} {level.number.toString().padStart(2,'0')}</Text> : <Text style={styles.body}>{t('contentUnavailable')}</Text>}
          </View>
          {complete && <Text style={styles.body}>{copy.complete}</Text>}
          <HomeAction testID="continue-campaign" primary label={complete?copy.replay:t('continue')} accessibilityLabel={level?`${complete?copy.replay:t('continue')} · ${copy.level} ${level.number}`:t('continue')} disabled={!writable||!level} onPress={()=>{
            if(writable && level && canStartLevel(state,locale,level.id)) router.push({pathname:'/game',params:{mode:'level',levelId:level.id}});
          }} />
          <LifeIndicator home />
        </View>
        {dailyAvailable && <View testID="daily-section" style={styles.daily}>
          <Text accessibilityRole="header" style={styles.dailyTitle}>{t('daily')}</Text>
          {prototypeLoreAvailable(locale) && <Text style={styles.teaser}>{dailyLore.introLines[0]}</Text>}
          <HomeAction testID="daily-action" dark label={dailyAvailable?t('playDaily'):copy.unavailable} disabled={!dailyAvailable} onPress={()=>{if(dailyAvailable)router.push('/daily');}} />
        </View>}
        <View style={styles.navigation}>
          <HomeAction testID="levels-action" dark label={t('levels')} onPress={()=>router.push('/levels')} />
          <HomeNotebook />
          <HomeAction testID="settings-action" dark label={t('settings')} onPress={()=>router.push('/settings')} />
        </View>
        {__DEV__ && !isTester && <HomeAction dark label="Draft Preview" onPress={()=>router.push('/draft-preview')} />}
        {homeAssets.professorIllustration && <HomeProfessor source={homeAssets.professorIllustration} />}
      </ScrollView>
    </SafeAreaView>
  </View>;
}
function HomeAction({label,accessibilityLabel,onPress,disabled=false,primary=false,dark=false,testID}:{label:string;accessibilityLabel?:string;onPress:()=>void;disabled?:boolean;primary?:boolean;dark?:boolean;testID?:string}) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel??label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.action,primary&&styles.primary,pressed&&!disabled&&styles.pressed]}>
    <Text style={[styles.actionText,(primary||dark)&&styles.lightText,disabled&&styles.disabledText]}>{label}</Text>
  </Pressable>;
}
const editorial=Platform.OS==='ios'?palette.typography.editorialIOS:palette.typography.editorialAndroid;
const functional=Platform.OS==='ios'?palette.typography.functionalIOS:palette.typography.functionalAndroid;
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:palette.background}, safe:{flex:1},
  overlay:{backgroundColor:palette.background,opacity:palette.overlayOpacity},
  content:{flexGrow:1,width:'100%',maxWidth:560,alignSelf:'center',paddingHorizontal:24,paddingTop:12,paddingBottom:24,gap:16},
  identity:{alignItems:'center',gap:4,paddingVertical:8},
  beta:{fontFamily:functional,color:palette.accent,fontSize:11,letterSpacing:3},
  wordmark:{fontFamily:editorial,color:palette.onDark,fontSize:64,lineHeight:78,letterSpacing:6},
  tagline:{fontFamily:editorial,color:palette.surface,fontSize:20,lineHeight:28},
  rule:{width:32,height:1,backgroundColor:palette.accent,marginTop:8},
  campaign:{backgroundColor:palette.surface,borderRadius:palette.radius,paddingHorizontal:18,paddingVertical:10,gap:4,shadowColor:palette.background,shadowOpacity:0.14,shadowRadius:6,shadowOffset:{width:0,height:3},elevation:2},
  eyebrow:{fontFamily:functional,color:palette.text,fontSize:11,lineHeight:18,letterSpacing:2},
  metadata:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',columnGap:8,rowGap:4},
  body:{fontFamily:functional,color:palette.text,fontSize:15,lineHeight:23},
  daily:{gap:10,paddingHorizontal:8},
  dailyTitle:{fontFamily:editorial,color:palette.onDark,fontSize:28,lineHeight:36},
  teaser:{fontFamily:functional,color:palette.surface,fontSize:15,lineHeight:24},
  navigation:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-around',borderTopWidth:1,borderTopColor:palette.accent,paddingTop:8},
  action:{minHeight:palette.tapTarget,minWidth:palette.tapTarget,justifyContent:'center',alignItems:'center',paddingVertical:8,paddingHorizontal:16,borderRadius:palette.radius},
  primary:{backgroundColor:palette.primary,marginVertical:0},
  actionText:{fontFamily:functional,fontSize:16,lineHeight:24,fontWeight:'600',color:palette.text,textAlign:'center'},
  lightText:{color:palette.onDark},disabledText:{opacity:0.6,fontWeight:'400'},pressed:{opacity:0.7},
  panel:{backgroundColor:palette.surface,borderRadius:palette.radius,padding:16,gap:12},
  logo:{width:'100%',maxWidth:240,height:78,overflow:'hidden'},
  // The approved square PNG has transparent top/bottom padding. Crop layout only.
  logoImage:{position:'absolute',width:128,height:128,top:-23,alignSelf:'center'},
});
