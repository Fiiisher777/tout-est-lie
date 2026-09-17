import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { AppText } from './AppText';
type Props = { label: string; children: ReactNode } | { label: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean };
export function SettingRow(props: Props) {
  return <View style={styles.row}>
    <AppText style={styles.label}>{props.label}</AppText>
    {'value' in props ? <Switch accessibilityLabel={props.label} value={props.value} onValueChange={props.onValueChange} disabled={props.disabled} /> : props.children}
  </View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 52 }, label: { flex: 1 } });
