import { create } from 'zustand';
import { translations, type Language, type Translations } from '../i18n/translations';

interface LanguageState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('nullnotes_language') as Language;
  if (saved === 'uk' || saved === 'en') return saved;
  const navLang = navigator.language.toLowerCase();
  return navLang.startsWith('uk') ? 'uk' : 'en';
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  t: translations[getInitialLanguage()],
  setLanguage: (language: Language) => {
    localStorage.setItem('nullnotes_language', language);
    set({ language, t: translations[language] });
  }
}));
