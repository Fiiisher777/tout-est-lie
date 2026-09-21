import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { puzzleTheme as theme } from '../../config/theme';
import { cardTextLines } from '../cardText';
export function PuzzleCard({ label, selected, disabled, onPress }: { label: string; selected: boolean; disabled: boolean; onPress: () => void }) {
  const [scale] = useState(() => new Animated.Value(1));
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  function animate(value: number) {
    if (reducedMotion) { scale.setValue(1); return; }
    Animated.timing(scale, { toValue: value, duration: 100, useNativeDriver: true }).start();
  }
  return <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress} onPressIn={() => animate(0.98)} onPressOut={() => animate(1)} style={[styles.card, selected && styles.selected]}>
      {cardTextLines(label).map((line, index) => <AppText key={index} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.3} style={[styles.label, selected && styles.selectedLabel]}>{line}</AppText>)}
    </Pressable>
  </Animated.View>;
}
const styles = StyleSheet.create({
  wrapper: { flex: 1, minWidth: 0 },
  card: { height: 70, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: theme.radius.card },
  selected: { backgroundColor: theme.accentSoft, borderColor: theme.accent, borderWidth: 2, paddingHorizontal: 3, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 3, elevation: 2 },
  selectedLabel: { color: theme.selectedText },
  label: { width: '100%', color: theme.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '700', textAlign: 'center' },
});
