import { useState } from 'react';
import { Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { SettingRow } from '../components/SettingRow';
import { useTranslation } from '../i18n';
import { usePlayer } from '../state/PlayerProvider';
import type { Language, Preferences } from '../state/player';
import { analytics } from '../services/analytics';
import { privacy } from '../services/privacy';
import { audio } from '../services/audio';
export function SettingsScreen() {
  const { t } = useTranslation(); const { state, writable, update } = usePlayer(); const [busy, setBusy] = useState(false);
  const preferences = state.preferences;
  async function change(value: Partial<Preferences>) {
    setBusy(true);
    if (value.sound === false) audio.stop();
    try { await update({ type: 'preferences', value }); } catch { /* Screen displays the save error and retry. */ }
    finally { setBusy(false); }
  }
  const languages: { value: Language; label: string }[] = [
    { value: 'system', label: t('system') }, { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' }, { value: 'es', label: 'Español' },
  ];
  return <Screen title={t('settings')}>
    <SettingRow label={t('sound')} value={preferences.sound} disabled={!writable || busy} onValueChange={sound => { void change({ sound }); }} />
    <AppText variant="muted">{t('soundHelp')}</AppText>
    <SettingRow label={t('haptics')} value={preferences.haptics} disabled={!writable || busy} onValueChange={haptics => { void change({ haptics }); }} />
    <AppText variant="subtitle">{t('language')}</AppText>
    {languages.map(language => <Button key={language.value} secondary selected={preferences.language === language.value} title={language.label} disabled={!writable || busy} onPress={() => { void change({ language: language.value }); }} />)}
    <Button secondary title={t('privacy')} onPress={() => { void privacy.openOptions(); Alert.alert(t('privacy'), t('privacyBody')); }} />
    <Button secondary title={t('reset')} disabled={!writable || busy} onPress={() => Alert.alert(t('resetTitle'), t('resetBody'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('reset'), style: 'destructive', onPress: () => {
        setBusy(true);
        void update({ type: 'resetProgress' }).then(() => analytics.track({ name: 'progress_reset' })).catch(() => {}).finally(() => setBusy(false));
      } },
    ])} />
  </Screen>;
}
