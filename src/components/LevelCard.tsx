import { StyleSheet, View } from 'react-native';
import { theme } from '../config/theme';
import { useTranslation } from '../i18n';
import { AppText } from './AppText';
import { Button } from './Button';
export function LevelCard({ number, completed, best, onPress, disabled, locked }: {
  number: number; completed: boolean; best?: number; onPress: () => void; disabled?: boolean; locked?: boolean;
}) {
  const { t } = useTranslation();
  return <View style={styles.card}>
    <AppText variant="subtitle">{t('level', { number })}</AppText>
    <AppText variant="muted">{t(locked ? 'locked' : completed ? 'completed' : 'available')}</AppText>
    {best !== undefined && <AppText>{t('best', { score: best })}</AppText>}
    <Button title={t('play')} onPress={onPress} disabled={disabled} />
  </View>;
}
const styles = StyleSheet.create({ card: { padding: 16, gap: 8, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface } });
