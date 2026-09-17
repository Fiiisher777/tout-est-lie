import { Pressable, StyleSheet } from 'react-native';
import { theme } from '../config/theme';
import { usePlayer } from '../state/PlayerProvider';
import { hapticFeedback } from '../services/haptics';
import { audio } from '../services/audio';
import { AppText } from './AppText';
export function Button({ title, onPress, disabled = false, secondary = false, selected = false }: {
  title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; selected?: boolean;
}) {
  const { state } = usePlayer();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled}
    onPress={() => { void hapticFeedback(state.preferences.haptics); void audio.play('press', state.preferences.sound).catch(() => {}); onPress(); }}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, (pressed || disabled) && styles.dimmed, selected && styles.selected]}>
    <AppText style={[styles.label, secondary && styles.secondaryLabel]}>{title}</AppText>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { backgroundColor: theme.primary, borderRadius: 10, padding: 14, minHeight: 48, justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  secondary: { backgroundColor: theme.surface, borderColor: theme.border },
  selected: { borderColor: theme.primary }, dimmed: { opacity: 0.55 },
  label: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' }, secondaryLabel: { color: theme.text },
});
