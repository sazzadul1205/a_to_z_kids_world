import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LanguageContext } from "./language-context";
import {
  DEFAULT_LOCALE,
  INTL_LOCALES,
  LOCALE_LABELS,
  STORAGE_KEY,
  SUPPORTED_LOCALES,
  detectLocale,
  dictionaryFor,
  interpolate,
  resolveTemplate,
} from "../../i18n";
import { formatBDT } from "../../lib/currency";

// localStorage throws in some privacy modes, so a failure must not stop the
// provider from rendering.
function readStored() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* preference simply will not persist */
  }
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() =>
    detectLocale(readStored(), navigator.languages ?? [navigator.language]),
  );

  // Set only by an explicit user action, so detection can be told apart from a
  // stored preference.
  const chosen = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    // Screen readers and font selection both key off the lang attribute, and
    // Bengali needs a lang of bn to pick the right glyphs.
    root.setAttribute("lang", locale);
    // Only a deliberate choice is stored. Writing the detected default would
    // freeze detection after the first visit, so a browser language change
    // later on would never be picked up.
    if (chosen.current) writeStored(locale);
  }, [locale]);

  const setLocale = useCallback((next) => {
    chosen.current = true;
    setLocaleState((current) =>
      next === current ? current : SUPPORTED_LOCALES.includes(next) ? next : DEFAULT_LOCALE,
    );
  }, []);

  const toggleLocale = useCallback(() => {
    chosen.current = true;
    setLocaleState((current) =>
      current === DEFAULT_LOCALE
        ? SUPPORTED_LOCALES.find((code) => code !== DEFAULT_LOCALE) ?? DEFAULT_LOCALE
        : DEFAULT_LOCALE,
    );
  }, []);

  const value = useMemo(() => {
    const dictionary = dictionaryFor(locale);

    // t("modal.close") and t("pages.checkout.title") resolve against the active
    // dictionary and fall back to English, so a missing translation never renders
    // as a key.
    const t = (path, params) => {
      const template = resolveTemplate(dictionary, dictionaryFor(DEFAULT_LOCALE), path);
      // Showing the key is loud enough to notice but harmless to ship.
      return interpolate(template ?? path, params);
    };

    // Picks the singular or plural form for a count. Bangla supplies both forms
    // as the same string, so this stays a single code path.
    const plural = (path, n) =>
      t(n === 1 ? `${path}One` : `${path}Other`, { n });

    return {
      locale,
      setLocale,
      toggleLocale,
      t,
      plural,
      // Prices follow the active locale, so Bangla renders Bengali digits. The
      // taka sign is handled inside formatBDT.
      formatPrice: (amount) => formatBDT(amount, INTL_LOCALES[locale] ?? INTL_LOCALES[DEFAULT_LOCALE]),
      // Direct handles for the two objects that used to be imported from
      // src/data, so consumers keep the same access shape.
      store: dictionary.store,
      pages: dictionary.pages,
      ui: dictionary.ui,
      messages: dictionary.messages,
      // Category names come from the API in English; this maps them for display
      // and passes through anything unrecognised.
      categoryLabel: (name) => dictionary.categories?.[name] ?? name,
      intlLocale: INTL_LOCALES[locale] ?? INTL_LOCALES[DEFAULT_LOCALE],
      localeLabel: LOCALE_LABELS[locale] ?? locale,
      isBangla: locale === "bn",
    };
  }, [locale, setLocale, toggleLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}