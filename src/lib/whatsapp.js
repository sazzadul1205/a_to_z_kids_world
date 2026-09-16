import { storeData } from "../data/store";

export const whatsappNumber = String(storeData.whatsapp.number).replace(
  /\D/g,
  "",
);
export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export const createWhatsAppUrl = (message) =>
  `${whatsappUrl}?text=${encodeURIComponent(message)}`;
