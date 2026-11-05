import {WHATSAPP_NUMBER} from '@/lib/constants';

// Enlace click-to-chat con mensaje prellenado según el contexto de la página
export const buildWhatsAppLink = (message: string): string =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
