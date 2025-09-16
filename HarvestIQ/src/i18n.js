import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';

const resources = {
  en: {
    translation: en
  },
  hi: {
    translation: hi
  },
  pa: {
    translation: pa
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
    }
  });

export default i18n;