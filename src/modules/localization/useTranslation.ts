/**
 * Nusantara App Builder - useTranslation Hook
 */

import { useSettingsStore } from '../../store/settingsStore';
import { translations, TranslationKey } from './translations';

export function useTranslation(): {
  t: TranslationKey;
  lang: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
} {
  const lang = useSettingsStore((s) => s.settings.language.current);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const t = translations[lang] || translations.id;

  return { t, lang, setLanguage };
}
