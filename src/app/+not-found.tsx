import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useTranslation } from '../i18n';
export default function NotFound() {
  const router = useRouter(); const { t } = useTranslation();
  return <Screen title={t('notFound')}><AppText>{t('notFoundHelp')}</AppText><Button title={t('backHome')} onPress={() => router.replace('/')} /></Screen>;
}
