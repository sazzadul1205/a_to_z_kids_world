const configuredNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

export const whatsappNumber = configuredNumber.replace(/\D/g, '');
export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export const createWhatsAppUrl = (message) => `${whatsappUrl}?text=${encodeURIComponent(message)}`;
