export type Language = 'en' | 'bm' | 'zh' | 'ta';

export const languageOptions: {
  code: Language;
  label: string;
  native: string;
  glyph: string;
  ready: boolean;
}[] = [
  { code: 'en', label: 'English', native: 'English', glyph: 'EN', ready: true },
  { code: 'bm', label: 'Bahasa Malaysia', native: 'Bahasa Malaysia', glyph: 'BM', ready: false },
  { code: 'zh', label: 'Chinese', native: '中文', glyph: '中', ready: false },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', glyph: 'த', ready: false },
];

export function languageName(language: Language) {
  return languageOptions.find((option) => option.code === language)?.label ?? 'English';
}
