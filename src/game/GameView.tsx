import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from '../i18n';
import { AppText } from '../components/AppText';
import { puzzleTheme as theme } from '../config/theme';
import { placeholderAds } from '../services/ads';
import { usePlayer } from '../state/PlayerProvider';
import { hapticFeedback } from '../services/haptics';
import type { GameViewProps } from './types';
import { calculateRemainingMistakes, clearSelection, deselectCard, getAvailableHints, selectCard, shuffleCards, submitSelection } from './engine/engine';
import { clock, usePuzzleSession } from './usePuzzleSession';
import { findLevel } from './content';
import { HintCard } from './components/HintCard';
import { PuzzleCard } from './components/PuzzleCard';
function Action({ title, onPress, disabled = false, primary = false }: { title: string; onPress: () => void; disabled?: boolean; primary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, primary && disabled && styles.primaryDisabled, pressed && styles.pressed]}>
    <AppText style={[styles.actionText, primary && styles.primaryText, disabled && styles.disabledText]}>{title}</AppText>
  </Pressable>;
}
function Feedback({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(timer); }, []);
  return visible ? <AppText accessibilityLiveRegion="polite" style={styles.feedback}>{message}</AppText> : null;
}
export function GameView(props: GameViewProps) {
  const { t } = useTranslation(); const router = useRouter();
  const { state: player, issue, retry } = usePlayer();
  const ads = placeholderAds({ title: t('adTitle'), body: t('adBody'), reward: t('simulateReward'), cancel: t('cancel') });
  const { state, ready, storageError, retryStorage, act, requestHint, restart, save, saving, adBusy, feedback } = usePuzzleSession(props, ads);
  const playing = state.status === 'playing'; const disabled = !ready || storageError || !playing || state.pauses.length > 0;
  const label = (id: string) => state.puzzle.cards.find(c => c.id === id)!.text;
  const hints = state.usedHints.map(id => {
    const hint = state.puzzle.hints.find(h => h.id === id)!;
    return hint.kind === 'pair' ? t('pairClue', { first: label(hint.cardIds[0]), second: label(hint.cardIds[1]) }) : hint.text;
  });
  function settings() {
    void hapticFeedback(player.preferences.haptics);
    Alert.alert(t('settings'), t('developmentPack'), [
      { text: t('settings'), onPress: () => router.push('/settings') },
      ...(!ready || storageError || adBusy || saving ? [] : [{ text: t('restart'), style: 'destructive' as const, onPress: () => Alert.alert(t('restartConfirm'), t('restartBody'), [
        { text: t('cancel'), style: 'cancel' }, { text: t('restart'), style: 'destructive', onPress: restart },
      ]) }]),
      { text: t('cancel'), style: 'cancel' },
    ]);
  }
  const title = props.launch.mode === 'daily' ? t('daily') : t('level', { number: findLevel(props.launch.levelId)?.number ?? 1 });
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('back')} style={styles.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}><View style={styles.chevron} /></Pressable>
      <View style={styles.heading}><AppText style={styles.brand}>Tout est lié</AppText><AppText style={styles.subtitle}>{title}</AppText></View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('settings')} style={styles.iconButton} onPress={settings}><AppText style={styles.gear}>⚙︎</AppText></Pressable>
    </View>
    {!ready ? <View style={styles.loading}><AppText style={styles.copy}>{t(storageError ? 'storageRead' : 'loading')}</AppText>{storageError && <Action title={t('retry')} onPress={retryStorage} />}</View> : <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {(storageError || issue) && <View style={styles.notice}><AppText style={styles.copy}>{t(storageError ? 'storageWrite' : issue === 'read' ? 'storageRead' : issue === 'write' ? 'storageWrite' : issue === 'recovered' ? 'recovered' : 'futureVersion')}</AppText>{issue !== 'futureVersion' && <Action title={t('retry')} onPress={() => storageError ? retryStorage() : void retry()} />}</View>}
        <AppText style={styles.instruction}>{t('instructions')}</AppText>
        <View style={styles.status}>
          <View accessible accessibilityLabel={t('mistakesRemaining', { count: calculateRemainingMistakes(state) })} accessibilityLiveRegion="polite" style={styles.dots}>
            {Array.from({ length: 4 }, (_, index) => <View key={index} style={[styles.dot, index >= calculateRemainingMistakes(state) && styles.emptyDot]} />)}
          </View>
          <AppText style={styles.meta}>{props.launch.mode === 'daily' ? props.launch.date : t('selectedCount', { count: state.selected.length })}</AppText>
        </View>
        <View style={styles.grid}>
          {Array.from({ length: Math.ceil(state.order.length / 4) }, (_, row) => <View key={row} style={styles.row}>
            {state.order.slice(row * 4, row * 4 + 4).map(id => <PuzzleCard key={id} label={label(id)} selected={state.selected.includes(id)} disabled={disabled} onPress={() => act(s => s.selected.includes(id) ? deselectCard(s, id) : selectCard(s, id))} />)}
          </View>)}
        </View>
        {state.solved.map(id => { const group = state.puzzle.groups.find(g => g.id === id)!; return <View key={id} style={styles.solved} accessible accessibilityLabel={`${group.label}: ${group.cardIds.map(label).join(', ')}`}>
          <AppText style={styles.category}>{group.label}</AppText><AppText style={styles.items}>{group.cardIds.map(label).join(' · ')}</AppText>
        </View>; })}
        {feedback && <Feedback key={`${state.sessionId}-${state.mistakes}-${state.solved.length}`} message={t(feedback === 'solved' ? 'correctGroup' : 'incorrectGroup')} />}
        <HintCard key={`${state.sessionId}-${hints.length}`} hints={hints} />
      </ScrollView>
      <View style={styles.footer}>
        {playing ? <>
          <View style={styles.secondary}>
            <Action title={t('shuffle')} disabled={disabled} onPress={() => act(shuffleCards)} />
            <Action title={t('clear')} disabled={disabled || !state.selected.length} onPress={() => act(clearSelection)} />
            <Action title={t('hint')} disabled={disabled || adBusy || !getAvailableHints(state).length} onPress={() => { void requestHint(); }} />
          </View>
          <Action primary title={t('submit')} disabled={disabled || state.selected.length !== 4} onPress={() => act(s => submitSelection(s, clock()))} />
        </> : <><AppText style={styles.terminal} accessibilityLiveRegion="polite">{t(state.status === 'won' ? 'won' : 'lost')}</AppText><Action primary title={t(saving ? 'saving' : 'viewResults')} disabled={saving} onPress={() => { void save(); }} /></>}
      </View>
    </>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.space.md, minHeight: 58, width: '100%', maxWidth: 560, alignSelf: 'center' },
  iconButton: { width: theme.tapTarget, height: theme.tapTarget, justifyContent: 'center', alignItems: 'center' },
  chevron: { width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: theme.textPrimary, transform: [{ rotate: '45deg' }] },
  gear: { fontSize: 23, lineHeight: 28, color: theme.textPrimary }, heading: { flex: 1, alignItems: 'center' },
  brand: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: theme.textPrimary, letterSpacing: -0.4 },
  subtitle: { fontSize: 11, lineHeight: 16, color: theme.textSecondary, letterSpacing: 0.6 },
  scroll: { flex: 1 }, content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: theme.space.lg, paddingTop: theme.space.sm, paddingBottom: theme.space.lg, gap: theme.space.sm },
  instruction: { fontSize: 14, lineHeight: 20, color: theme.textSecondary, textAlign: 'center' },
  status: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28, marginBottom: theme.space.xs },
  dots: { flexDirection: 'row', gap: 6 }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: theme.accent, borderWidth: 1, borderColor: theme.accent }, emptyDot: { backgroundColor: theme.background, borderColor: theme.textSecondary },
  meta: { fontSize: 12, lineHeight: 18, color: theme.textSecondary }, grid: { gap: 6 }, row: { flexDirection: 'row', gap: 6 },
  solved: { paddingVertical: theme.space.sm, paddingHorizontal: theme.space.md, borderRadius: theme.radius.card, backgroundColor: theme.successSurface },
  category: { fontSize: 12, lineHeight: 17, fontWeight: '700', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: 0.6 }, items: { fontSize: 12, lineHeight: 17, color: theme.textSecondary },
  feedback: { fontSize: 13, lineHeight: 19, color: theme.textSecondary, textAlign: 'center', paddingVertical: theme.space.xs },
  footer: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: theme.space.lg, paddingTop: theme.space.xs, paddingBottom: theme.space.sm, backgroundColor: theme.background, gap: theme.space.xs },
  secondary: { flexDirection: 'row', gap: theme.space.sm }, action: { minHeight: theme.tapTarget, flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.space.sm, paddingVertical: theme.space.sm },
  actionText: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: theme.accent }, primary: { minHeight: 48, borderRadius: theme.radius.button, backgroundColor: theme.accent }, primaryText: { color: theme.onAccent, letterSpacing: 1.4, textTransform: 'uppercase' },
  primaryDisabled: { backgroundColor: theme.disabledSurface }, disabledText: { color: theme.disabledText }, pressed: { opacity: 0.75 },
  terminal: { fontSize: 16, lineHeight: 22, color: theme.textPrimary, textAlign: 'center', fontWeight: '600' },
  loading: { padding: theme.space.xl }, copy: { fontSize: 14, lineHeight: 20, color: theme.textPrimary }, notice: { backgroundColor: theme.hintSurface, padding: theme.space.md, borderRadius: theme.radius.panel },
});
