import { useLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { useMemo } from 'react';
import { usePlayer } from '../state/PlayerProvider';
import type { Locale } from '../game/content/schema';
import { en, type TranslationKey } from './en';
import { fr } from './fr';
import { es } from './es';
export function useTranslation() {
  const { state } = usePlayer();
  const locales = useLocales();
  const system = locales.find(locale => ['en', 'fr', 'es'].includes(locale.languageCode ?? ''))?.languageCode ?? 'en';
  const locale = state.preferences.language === 'system' ? system : state.preferences.language;
  const i18n = useMemo(() => new I18n({ en, fr, es }, { locale, defaultLocale: 'en', enableFallback: true }), [locale]);
  return { locale: locale as Locale, t: (key: TranslationKey, values?: Record<string, string | number>) => i18n.t(key, values) as string };
}
