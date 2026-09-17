import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../config/theme';
import { usePlayer } from '../state/PlayerProvider';
import { useTranslation } from '../i18n';
import { AppText } from './AppText';
import { Button } from './Button';
export function Screen({ children, title }: { children: ReactNode; title?: string }) {
  const { issue, retry } = usePlayer();
  const { t } = useTranslation();
  return <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {title && <AppText variant="title">{title}</AppText>}
      {issue && <View style={styles.notice} accessibilityLiveRegion="polite">
        <AppText>{t(issue === 'read' ? 'storageRead' : issue === 'write' ? 'storageWrite' : issue)}</AppText>
        {issue !== 'futureVersion' && <Button secondary title={t('retry')} onPress={() => { void retry(); }} />}
      </View>}
      {children}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 600, alignSelf: 'center', flexGrow: 1 },
  notice: { padding: 16, gap: 12, borderWidth: 1, borderColor: theme.danger, borderRadius: 10 },
});
