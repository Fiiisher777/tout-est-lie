import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { puzzleTheme as theme } from '../../config/theme';
import { useTranslation } from '../../i18n';
export function HintCard({ hints }: { hints: readonly string[] }) {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  if (!hints.length) return null;
  const index = (hints.length - 1 - offset + hints.length) % hints.length;
  return <View style={styles.card}>
    <View style={styles.copy} accessibilityLiveRegion="polite">
      <AppText style={styles.eyebrow}>{t('hint')} · {index + 1}/{hints.length}</AppText>
      <AppText style={styles.text}>{hints[index]}</AppText>
    </View>
    {hints.length > 1 && <Pressable accessibilityRole="button" accessibilityLabel={t('reviewHints')} onPress={() => setOffset(value => (value + 1) % hints.length)} style={styles.review}>
      <AppText style={styles.arrow}>↺</AppText>
    </Pressable>}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: theme.hintSurface, borderRadius: theme.radius.panel, paddingLeft: theme.space.md, paddingVertical: theme.space.sm, paddingRight: theme.space.xs, flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  copy: { flex: 1 }, eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: '700', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  text: { fontSize: 14, lineHeight: 20, color: theme.textPrimary },
  review: { minWidth: theme.tapTarget, minHeight: theme.tapTarget, alignItems: 'center', justifyContent: 'center' }, arrow: { color: theme.accent, fontSize: 24 },
});
