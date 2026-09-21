import { GameplayFlavor, ProfessorReaction } from '../lore/components';
import { LifeIndicator } from '../components/LifeIndicator';
import { playtest, formatTime } from '../config/playtest';
import { entitlements } from '../services/entitlements';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from '../i18n';
import { AppText } from '../components/AppText';
import { puzzleTheme as theme } from '../config/theme';
import { placeholderAds } from '../services/ads';
import { usePlayer } from '../state/PlayerProvider';
import { hapticFeedback } from '../services/haptics';
import type { GameViewProps } from './types';
import { clearSelection, deselectCard, getAvailableHints, selectCard, shuffleCards, submitSelection } from './engine/engine';
import { clock, usePuzzleSession } from './usePuzzleSession';
import { findLevel } from './content';
import { HintCard } from './components/HintCard';
import { PuzzleBoard } from './components/PuzzleBoard';
import { HintSheet } from './components/HintSheet';
import { zoneForLevel } from '../lore/content';
import { audio } from '../services/audio';
import { createCompletionTransition } from './completionTransition';
function Action({ title, onPress, disabled = false, primary = false }: { title: string; onPress: () => void; disabled?: boolean; primary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, primary && disabled && styles.primaryDisabled, pressed && styles.pressed]}>
    <AppText style={[styles.actionText, primary && styles.primaryText, disabled && styles.disabledText]}>{title}</AppText>
  </Pressable>;
}
export function Feedback({ message, penalty = false }: { message: string; penalty?: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(timer); }, []);
  return visible ? <AppText accessibilityLiveRegion="polite" style={[styles.feedback, penalty && styles.penalty]}>{message}</AppText> : null;
}
export function GameView(props: GameViewProps) {
  const { t, locale } = useTranslation(); const [hintOpen,setHintOpen]=useState(false); const [menuOpen,setMenuOpen]=useState(false); const router = useRouter();
  const { state: player, issue, retry } = usePlayer();
  const [completionTransition]=useState(createCompletionTransition);
  const ads = placeholderAds({ title: t('adTitle'), body: t('simulatedAdBody'), reward: t('completeAd'), cancel: t('cancel') });
  const { state, remaining, blocked, requestContinue, declineContinue, ready, storageError, retryStorage, act, requestHint, restart, save, saving, adBusy, feedback } = usePuzzleSession({...props,onComplete:result=>completionTransition.complete(result,props.onComplete)}, ads);
  const playing = state.status === 'playing'; const disabled = !ready || storageError || !playing || state.pauses.length > 0;
  const label = (id: string) => state.puzzle.cards.find(c => c.id === id)!.text;
  const hints = state.usedHints.map(id => {
    const hint = state.puzzle.hints.find(h => h.id === id)!;
    return hint.kind === 'pair' ? t('pairClue', { first: label(hint.cardIds[0]), second: label(hint.cardIds[1]) }) : hint.text;
  });
  function settings() {
    void hapticFeedback(player.preferences.haptics);
    setMenuOpen(true);
  }
  function confirmRestart() {
    setMenuOpen(false);
    Alert.alert(t('restartConfirm'),t('restartBody'),[
      {text:t('cancel'),style:'cancel'},{text:t('restart'),style:'destructive',onPress:restart},
    ]);
  }
  const position=props.developmentPreview?.position ?? findLevel(props.launch.levelId)?.number;
  const zone=position&&locale==='fr'?zoneForLevel(position):undefined;
  const title=props.launch.mode==='daily'?t('daily'):t('level',{number:position??1});
  const headerTitle=[zone?.name,title].filter(Boolean).join(' · ');
  const hintKinds=getAvailableHints(state).map(h=>h.kind);
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('back')} style={styles.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}><View style={styles.chevron} /></Pressable>
      <View style={styles.heading}>
        <AppText style={styles.subtitle}>{headerTitle}</AppText>
        <AppText style={styles.meta}>{t('connections',{count:state.solved.length})}</AppText>
        {__DEV__&&props.developmentPreview&&<AppText style={styles.meta}>DRAFT</AppText>}
      </View>
      {remaining!==null&&<View testID="game-timer" style={styles.timerArea}>
        <AppText accessibilityLabel={t('timeRemaining',{time:formatTime(remaining)})} style={[styles.timer,remaining<playtest.urgencySeconds*1000&&styles.urgent]}>{formatTime(remaining).padStart(5,'0')}</AppText>
        {feedback==='mistake'&&<Feedback key={`${state.sessionId}-${state.mistakes}`} penalty message={t('wrongPenalty',{seconds:playtest.wrongAnswerPenaltySeconds})} />}
      </View>}
      <Pressable accessibilityRole="button" accessibilityLabel={t('settings')} style={styles.iconButton} onPress={settings}><AppText style={styles.gear}>⚙︎</AppText></Pressable>
    </View>
    {!ready ? <View style={styles.loading}>{blocked && <LifeIndicator onReward={retryStorage} />}<AppText style={styles.copy}>{blocked ? t('noLives') : t(storageError ? 'storageRead' : 'loading')}</AppText>{(storageError || blocked) && <Action title={t('retry')} onPress={retryStorage} />}</View> : <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {(storageError || issue) && <View style={styles.notice}><AppText style={styles.copy}>{t(storageError ? 'storageWrite' : issue === 'read' ? 'storageRead' : issue === 'write' ? 'storageWrite' : issue === 'recovered' ? 'recovered' : 'futureVersion')}</AppText>{issue !== 'futureVersion' && <Action title={t('retry')} onPress={() => storageError ? retryStorage() : void retry()} />}</View>}
        <AppText style={styles.instruction}>{t('instructions')}</AppText>
        <PuzzleBoard state={state} disabled={disabled} onCard={id=>act(s=>s.selected.includes(id)?deselectCard(s,id):selectCard(s,id))}
          onCompletionReady={completionTransition.finish} onResolved={()=>{void audio.play('complete',player.preferences.sound);}} />
        <AppText style={styles.meta}>{t('selectedCount',{count:state.selected.length})}</AppText>
        {(feedback==='solved'||(feedback==='mistake'&&remaining===null))&&<Feedback key={`${state.sessionId}-${state.mistakes}-${state.solved.length}`} message={feedback==='solved'?t('correctGroup'):remaining===null?t('incorrectGroup'):''} />}
        <GameplayFlavor state={state} textStyle={styles.meta} />
        <HintCard key={`${state.sessionId}-${hints.length}`} hints={hints} />
      </ScrollView>
      <View style={styles.footer}>
        {playing && state.timedOut ? <>
          <AppText style={styles.terminal} accessibilityLiveRegion="polite">{t('timesUp')}</AppText>
          <ProfessorReaction kind="timeout" seed={state.sessionId} textStyle={styles.meta} />
          <AppText style={styles.meta}>{t('groupsFound', { count: state.solved.length })}</AppText>
          <Action primary title={t(entitlements.isPremium ? 'freeContinue' : 'rewardContinue', { seconds: playtest.extensionSeconds })} disabled={adBusy} onPress={() => { void requestContinue(); }} />
          <Action title={t('endAttempt')} disabled={adBusy} onPress={declineContinue} />
        </> : playing ? <>
          <View style={styles.secondary}>
            <Action title={t('hint')} disabled={disabled||adBusy||!hintKinds.length} onPress={()=>setHintOpen(true)} />
            <Action primary title={t('submit')} disabled={disabled||state.selected.length!==4} onPress={()=>act(s=>{const transition=submitSelection(s,clock());completionTransition.observe(transition);return transition;})} />
          </View>
        </> : <><AppText style={styles.terminal} accessibilityLiveRegion="polite">{t(state.status === 'won' ? 'won' : 'lost')}</AppText><Action primary title={t(saving ? 'saving' : 'viewResults')} disabled={saving} onPress={() => { void save(); }} /></>}
      </View>
    </>}
    <Modal transparent animationType="none" visible={menuOpen} onRequestClose={()=>setMenuOpen(false)}>
      <SafeAreaView style={styles.menu} accessibilityViewIsModal><View style={styles.menuPanel}>
        <Action title={t('shuffle')} disabled={disabled} onPress={()=>{setMenuOpen(false);act(shuffleCards);}} />
        <Action title={t('clear')} disabled={disabled||!state.selected.length} onPress={()=>{setMenuOpen(false);act(clearSelection);}} />
        <Action title={t('settings')} onPress={()=>{setMenuOpen(false);router.push('/settings');}} />
        <Action title={t('restart')} disabled={!ready||storageError||adBusy||saving||!playing||!!state.timedOut} onPress={confirmRestart} />
        <Action title={t('cancel')} onPress={()=>setMenuOpen(false)} />
      </View></SafeAreaView>
    </Modal>
    <HintSheet visible={hintOpen&&!disabled&&!adBusy&&!state.timedOut} available={hintKinds} onClose={()=>setHintOpen(false)} onChoose={kind=>{setHintOpen(false);void requestHint(kind);}} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  menu:{flex:1,justifyContent:'flex-end',backgroundColor:theme.background},menuPanel:{padding:20,gap:8},
  safe: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.space.md, minHeight: 58, width: '100%', maxWidth: 560, alignSelf: 'center' },
  iconButton: { width: theme.tapTarget, height: theme.tapTarget, justifyContent: 'center', alignItems: 'center' },
  chevron: { width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: theme.environmentText, transform: [{ rotate: '45deg' }] },
  gear: { fontSize: 21, lineHeight: 28, color: theme.environmentText }, heading: { flex: 1, gap:2 },
  subtitle: { fontSize: 11, lineHeight: 16, color: theme.environmentText, letterSpacing: 0.6, textTransform:'uppercase' },
  scroll: { flex: 1 }, content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: theme.space.lg, paddingTop: theme.space.sm, paddingBottom: theme.space.lg, gap: theme.space.sm },
  instruction: { fontSize: 13, lineHeight: 20, color: theme.environmentText, textAlign: 'center' },
  meta: {fontSize:12,lineHeight:18,color:theme.environmentText},
  timerArea:{alignItems:'flex-end',paddingLeft:8},timer:{fontSize:20,lineHeight:26,fontVariant:['tabular-nums'],color:theme.environmentText},
  urgent:{color:theme.danger,backgroundColor:theme.penaltySurface,borderRadius:4,paddingHorizontal:4},
  penalty:{color:theme.danger,backgroundColor:theme.penaltySurface,borderRadius:4,paddingHorizontal:4},
  feedback: { fontSize: 13, lineHeight: 19, color: theme.environmentText, textAlign: 'center', paddingVertical: theme.space.xs },
  footer: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: theme.space.lg, paddingTop: theme.space.xs, paddingBottom: theme.space.sm, backgroundColor: theme.background, gap: theme.space.xs },
  secondary: { flexDirection: 'row', gap: theme.space.sm }, action: { minHeight: theme.tapTarget, flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.space.sm, paddingVertical: theme.space.sm },
  actionText: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: theme.accent }, primary: { minHeight: 48, borderRadius: theme.radius.button, backgroundColor: theme.accent }, primaryText: { color: theme.onAccent, letterSpacing: 1.4, textTransform: 'uppercase' },
  primaryDisabled: { backgroundColor: theme.disabledSurface, opacity:0.55 }, disabledText: { color: theme.disabledText }, pressed: { opacity: 0.75 },
  terminal: { fontSize: 16, lineHeight: 22, color: theme.environmentText, textAlign: 'center', fontWeight: '600' },
  loading: { padding: theme.space.xl, backgroundColor:theme.surface }, copy: { fontSize: 14, lineHeight: 20, color: theme.textPrimary }, notice: { backgroundColor: theme.hintSurface, padding: theme.space.md, borderRadius: theme.radius.panel },
});
