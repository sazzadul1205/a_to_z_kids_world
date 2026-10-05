import en from "./en";
import bn from "./bn";

// English is the fallback for any key a translation has not filled in yet, so a
// partially translated locale degrades to English instead of showing a raw key.
const LOCALES = { en, bn };

export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = Object.keys(LOCALES);

// Short codes shown on the toggle itself.
export const LOCALE_LABELS = { en: "EN", bn: "বাং" };

// Intl locales, used for number and date formatting.
export const INTL_LOCALES = { en: "en-BD", bn: "bn-BD" };

export const STORAGE_KEY = "a-to-z-kids-language";

// Resolves "bn-BD", "bn", or an unsupported value to a supported locale.
export function normaliseLocale(value) {
  if (!value || typeof value !== "string") return null;
  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  return base in LOCALES ? base : null;
}

// Picks the visitor's language from what the browser reports, preferring a
// stored choice. Bangla is detected from the primary language tag only.
export function detectLocale(stored, navigatorLanguages) {
  const fromStorage = normaliseLocale(stored);
  if (fromStorage) return fromStorage;

  const candidates = Array.isArray(navigatorLanguages) ? navigatorLanguages : [];
  for (const candidate of candidates) {
    const match = normaliseLocale(candidate);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

export function dictionaryFor(locale) {
  return LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
}

// Walks a dotted path, falling back to the English dictionary when the active
// one has no entry at that path.
export function lookup(dictionary, fallback, path) {
  const read = (source) =>
    path.split(".").reduce((node, part) => (node == null ? undefined : node[part]), source);

  const value = read(dictionary);
  if (value !== undefined) return value;
  return read(fallback);
}

// Component copy lives under `ui`, so t("modal.close") reads it without callers
// having to repeat the prefix. An explicit "ui." prefix still resolves, and the
// full path is tried first so a top-level section always wins over a ui one.
export function resolveTemplate(dictionary, fallback, path) {
  return (
    lookup(dictionary, fallback, path) ?? lookup(dictionary, fallback, `ui.${path}`)
  );
}

// Replaces {name} placeholders. Values are passed through String() so numbers and
// formatted amounts interpolate cleanly.
export function interpolate(template, values) {
  if (typeof template !== "string" || !values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    values[key] === undefined || values[key] === null ? match : String(values[key]),
  );
}