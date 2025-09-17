import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import ar from './locales/ar.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';

const resources = {
  en: {
    translation: en
  },
  hi: {
    translation: hi
  },
  pa: {
    translation: pa
  },
  fr: {
    translation: fr
  },
  es: {
    translation: es
  },
  de: {
    translation: de
  },
  ar: {
    translation: ar
  },
  bn: {
    translation: bn
  },
  ta: {
    translation: ta
  },
  te: {
    translation: te
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    // Configure RTL support for Arabic
    react: {
      useSuspense: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

// Export language configurations
export const languages = {
  en: { name: 'English', dir: 'ltr', flag: '🇺🇸' },
  hi: { name: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  pa: { name: 'ਪੰਜਾਬੀ', dir: 'ltr', flag: '🇮🇳' },
  fr: { name: 'Français', dir: 'ltr', flag: '🇫🇷' },
  es: { name: 'Español', dir: 'ltr', flag: '🇪🇸' },
  de: { name: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  ar: { name: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  bn: { name: 'বাংলা', dir: 'ltr', flag: '🇧🇩' },
  ta: { name: 'தமிழ்', dir: 'ltr', flag: '🇮🇳' },
  te: { name: 'తెలుగు', dir: 'ltr', flag: '🇮🇳' }
};

// Function to handle RTL/LTR switching
export const updateDirection = (language) => {
  const dir = languages[language]?.dir || 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
};

export default i18n;