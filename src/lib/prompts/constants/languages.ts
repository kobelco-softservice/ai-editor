
// src/lib/prompts/constants/languages.ts
export const SUPPORTED_LANGUAGES = {
    ja: '日本語',
    en: 'English',
    zh: '中文',
    ko: '한국어',
    fr: 'Français',
    es: 'Español'
  } as const;
  
  export type Language = keyof typeof SUPPORTED_LANGUAGES;
  
  export const DEFAULT_LANGUAGE: Language = 'ja';