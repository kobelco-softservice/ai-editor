import zh from './zh.json';
import en from './en.json';
import ja from './ja.json';

const translations = {
  zh,
  en,
  ja,
};

export const getTranslation = (lang: 'zh' | 'en' | 'ja') => {
  return translations[lang] || translations.ja; // デフォルトは日本語
};