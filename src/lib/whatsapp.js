import { storeData } from "../data/store";

const configuredNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

export const whatsappNumber = String(configuredNumber || storeData.whatsapp.number).replace(
  /\D/g,
  "",
);

export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export const createWhatsAppUrl = (message) =>
  `${whatsappUrl}?text=${encodeURIComponent(message)}`;