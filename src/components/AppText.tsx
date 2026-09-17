import { StyleSheet, Text, type TextProps } from 'react-native';
import { theme } from '../config/theme';
export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: 'body' | 'title' | 'subtitle' | 'muted' }) {
  return <Text {...props} accessibilityRole={variant === 'title' ? 'header' : props.accessibilityRole} style={[styles.body, styles[variant], style]} />;
}
const styles = StyleSheet.create({
  body: { fontSize: 17, lineHeight: 25, color: theme.text },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  subtitle: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  muted: { color: theme.muted, fontSize: 15, lineHeight: 23 },
});
