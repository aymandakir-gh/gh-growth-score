// ─────────────────────────────────────────────────────────────────────────────
// i18n — GH-Global-Defaults P1 language support
// Covers UI chrome (nav, footer). Quiz content stays EN for now (future sprint).
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGES = [
  { code: "en",    label: "English",    dir: "ltr", flag: "🇬🇧" },
  { code: "ar",    label: "العربية",    dir: "rtl", flag: "🇸🇦" },
  { code: "it",    label: "Italiano",   dir: "ltr", flag: "🇮🇹" },
  { code: "nl",    label: "Nederlands", dir: "ltr", flag: "🇳🇱" },
  { code: "zh-CN", label: "中文",       dir: "ltr", flag: "🇨🇳" },
  { code: "es",    label: "Español",    dir: "ltr", flag: "🇪🇸" },
  { code: "fr",    label: "Français",   dir: "ltr", flag: "🇫🇷" },
  { code: "de",    label: "Deutsch",    dir: "ltr", flag: "🇩🇪" },
  { code: "pt-BR", label: "Português",  dir: "ltr", flag: "🇧🇷" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export interface UITranslations {
  nav: {
    title: string;
    openSource: string;
  };
  footer: {
    openSource: string;
    github: string;
    privacy: string;
    license: string;
  };
  selectLanguage: string;
}

export const translations: Record<LangCode, UITranslations> = {
  en: {
    nav:    { title: "Growth Health Score", openSource: "Open source · MIT" },
    footer: { openSource: "Open source · MIT", github: "GitHub", privacy: "Privacy", license: "MIT License" },
    selectLanguage: "Select language",
  },
  ar: {
    nav:    { title: "درجة صحة النمو", openSource: "مفتوح المصدر · MIT" },
    footer: { openSource: "مفتوح المصدر · MIT", github: "GitHub", privacy: "الخصوصية", license: "رخصة MIT" },
    selectLanguage: "اختر اللغة",
  },
  it: {
    nav:    { title: "Growth Health Score", openSource: "Open source · MIT" },
    footer: { openSource: "Open source · MIT", github: "GitHub", privacy: "Privacy", license: "Licenza MIT" },
    selectLanguage: "Seleziona lingua",
  },
  nl: {
    nav:    { title: "Growth Health Score", openSource: "Open source · MIT" },
    footer: { openSource: "Open source · MIT", github: "GitHub", privacy: "Privacy", license: "MIT-licentie" },
    selectLanguage: "Taal kiezen",
  },
  "zh-CN": {
    nav:    { title: "增长健康评分", openSource: "开源 · MIT" },
    footer: { openSource: "开源 · MIT", github: "GitHub", privacy: "隐私政策", license: "MIT许可证" },
    selectLanguage: "选择语言",
  },
  es: {
    nav:    { title: "Growth Health Score", openSource: "Código abierto · MIT" },
    footer: { openSource: "Código abierto · MIT", github: "GitHub", privacy: "Privacidad", license: "Licencia MIT" },
    selectLanguage: "Seleccionar idioma",
  },
  fr: {
    nav:    { title: "Growth Health Score", openSource: "Open source · MIT" },
    footer: { openSource: "Open source · MIT", github: "GitHub", privacy: "Confidentialité", license: "Licence MIT" },
    selectLanguage: "Choisir la langue",
  },
  de: {
    nav:    { title: "Growth Health Score", openSource: "Open Source · MIT" },
    footer: { openSource: "Open Source · MIT", github: "GitHub", privacy: "Datenschutz", license: "MIT-Lizenz" },
    selectLanguage: "Sprache wählen",
  },
  "pt-BR": {
    nav:    { title: "Growth Health Score", openSource: "Código aberto · MIT" },
    footer: { openSource: "Código aberto · MIT", github: "GitHub", privacy: "Privacidade", license: "Licença MIT" },
    selectLanguage: "Selecionar idioma",
  },
};

export function getLangDir(code: LangCode): "ltr" | "rtl" {
  return (LANGUAGES.find((l) => l.code === code)?.dir ?? "ltr") as "ltr" | "rtl";
}

export function isValidLang(code: string): code is LangCode {
  return LANGUAGES.some((l) => l.code === code);
}
