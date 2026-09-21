import { useCallback, useState, useSyncExternalStore } from 'react';
import { AppState, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from '../i18n';
import { homeTheme as theme } from '../config/theme';
import { eligibleCards, loreUiFr, prototypeLoreAvailable, ritual, type LoreCard } from './content';
import { loreStore } from './store';

export function HomeNotebook() {
  const {locale}=useTranslation();
  return prototypeLoreAvailable(locale)?<ActiveNotebook />:null;
}
function ActiveNotebook() {
  const {locale}=useTranslation();
  const state=useSyncExternalStore(loreStore.subscribe,loreStore.snapshot,loreStore.snapshot);
  const [card,setCard]=useState<LoreCard>();const [collection,setCollection]=useState(false);
  const [error,setError]=useState(false);const [busy,setBusy]=useState(false);
  useFocusEffect(useCallback(()=>{
    let active=true;
    const visit=()=>{void loreStore.visit(locale).then(value=>{if(active){setCard(current=>value.card??current);setError(false);}}).catch(()=>{if(active)setError(true);});};
    if(AppState.currentState==='active')visit();
    const subscription=AppState.addEventListener('change',status=>{if(status==='active')visit();});
    return()=>{active=false;subscription.remove();};
  },[locale]));
  function save(id:string,saved:boolean) {
    setBusy(true);setError(false);
    void loreStore.setSaved(id,saved,locale).catch(()=>setError(true)).finally(()=>setBusy(false));
  }
  return <>
    <NotebookAction testID="notebook-action" dark title="Carnet" onPress={()=>{setCollection(true);void loreStore.refresh().catch(()=>setError(true));}} />
    <LoreOverlay card={card} collection={collection} savedIds={state.savedLoreCardIds} cards={eligibleCards(locale)} busy={busy} error={error}
      onSave={save} onClose={()=>{setCard(undefined);setCollection(false);setError(false);}} />
  </>;
}
// One mutually exclusive surface: the opening card never also renders in the collection.
export function LoreOverlay({card,collection,savedIds,cards,busy,error,onSave,onClose}:{card?:LoreCard;collection:boolean;savedIds:readonly string[];cards:readonly LoreCard[];busy:boolean;error:boolean;onSave:(id:string,saved:boolean)=>void;onClose:()=>void}) {
  if(!card&&!collection)return null;
  const saved=!!card&&savedIds.includes(card.id);
  const collectionCards=cards.filter(c=>savedIds.includes(c.id));
  return <Modal testID="lore-overlay" transparent animationType="none" visible onRequestClose={onClose}>
    <SafeAreaView style={styles.backdrop}>
      <View style={styles.sheet} accessibilityViewIsModal>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.eyebrow}>{card?ritual.name.toLocaleUpperCase('fr'):ritual.collectionName}</Text>
          {card ? <View testID="opening-ritual" style={styles.card}>
            <Text style={styles.meta}>{loreUiFr.categories[card.type]} · Note n°{card.id.match(/\d+$/)?.[0]??card.id}</Text>
            <Text accessibilityRole="header" style={styles.title}>{card.title}</Text>
            <Text style={styles.body}>{card.body}</Text>
            {card.professorNote&&<Text style={styles.body}>{card.professorNote}</Text>}
            {saved ? <Text testID="opening-saved" accessibilityLiveRegion="polite" style={styles.meta}>{loreUiFr.saved}</Text>
              : <NotebookAction testID="opening-save" title="Conserver" disabled={busy} onPress={()=>onSave(card.id,true)} />}
          </View> : <View testID="notebook-collection" style={styles.card}>
            {collectionCards.length===0&&<Text style={styles.body}>{loreUiFr.empty}</Text>}
            {collectionCards.map(c=><View key={c.id} style={styles.card}>
              <Text style={styles.title}>{c.title}</Text><Text style={styles.body}>{c.body}</Text>
              {c.professorNote&&<Text style={styles.body}>{c.professorNote}</Text>}
              <NotebookAction title={loreUiFr.remove} disabled={busy} onPress={()=>onSave(c.id,false)} />
            </View>)}
          </View>}
          {error&&<Text accessibilityLiveRegion="polite" style={styles.body}>{loreUiFr.error}</Text>}
          <NotebookAction testID="lore-close" primary title={card?ritual.actions[0]:loreUiFr.close} onPress={onClose} />
        </ScrollView>
      </View>
    </SafeAreaView>
  </Modal>;
}
function NotebookAction({title,onPress,disabled=false,dark=false,primary=false,testID}:{title:string;onPress:()=>void;disabled?:boolean;dark?:boolean;primary?:boolean;testID?:string}) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled}} disabled={disabled} onPress={onPress}
    style={({pressed})=>[styles.action,primary&&styles.primary,{opacity:pressed||disabled?0.6:1}]}>
    <Text style={[styles.actionText,(dark||primary)&&styles.light]}>{title}</Text>
  </Pressable>;
}
const styles=StyleSheet.create({
  backdrop:{flex:1,backgroundColor:theme.background,justifyContent:'center',padding:20},
  sheet:{maxHeight:'100%',width:'100%',maxWidth:520,alignSelf:'center',backgroundColor:theme.surface,borderRadius:theme.radius},
  content:{padding:24,gap:18},card:{gap:12},
  eyebrow:{color:theme.text,fontSize:13,lineHeight:20,letterSpacing:1.4},
  meta:{color:theme.text,fontSize:14,lineHeight:22},
  title:{color:theme.text,fontFamily:Platform.OS==='ios'?theme.typography.editorialIOS:theme.typography.editorialAndroid,fontSize:28,lineHeight:36},
  body:{color:theme.text,fontSize:17,lineHeight:26},
  action:{minHeight:theme.tapTarget,minWidth:theme.tapTarget,padding:12,justifyContent:'center',alignItems:'center',borderRadius:theme.radius},
  primary:{backgroundColor:theme.primary},actionText:{color:theme.text,fontSize:16,lineHeight:24,fontWeight:'600',textAlign:'center'},light:{color:theme.onDark},
});
