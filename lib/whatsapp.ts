import {WHATSAPP_NUMBER} from '@/lib/constants';

export const buildWhatsAppLink = (message: string): string =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
