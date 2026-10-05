import en from "../i18n/en";

// The number is configuration rather than copy, so it is read from the English
// dictionary regardless of the browsing language and needs no reactivity.
const configuredNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

export const whatsappNumber = String(configuredNumber || en.store.whatsapp.number).replace(
  /\D/g,
  "",
);

export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export const createWhatsAppUrl = (message) =>
  `${whatsappUrl}?text=${encodeURIComponent(message)}`;