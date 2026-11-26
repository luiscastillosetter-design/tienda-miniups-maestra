// Enlace universal de WhatsApp hacia Administración (+58 422-5160057).
export const ADMIN_WA_PHONE = '584225160057';

export const adminWaLink = (text: string) =>
  `https://api.whatsapp.com/send?phone=${ADMIN_WA_PHONE}&text=${encodeURIComponent(text)}`;

export const STORE_URL = 'https://www.importadoratodomax.com';
