const configuredNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '15551234567';

export const whatsappNumber = configuredNumber.replace(/\D/g, '');
export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export const createWhatsAppUrl = (message) => `${whatsappUrl}?text=${encodeURIComponent(message)}`;
