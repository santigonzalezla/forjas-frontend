export const SERVER_URL      = process.env.NEXT_PUBLIC_SERVER_URL      || 'http://localhost:3000';
export const API_BASE_URL    = process.env.NEXT_PUBLIC_API_BASE_URL    || 'http://localhost:5001/api';
export const APP_NAME        = process.env.NEXT_PUBLIC_APP_NAME        || 'Forjas · Hierro Hecho Arte';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Portones, rejas, barandas y muebles en hierro forjado hechos a mano en Valledupar desde 1997. Envíos a todo Colombia.';

// Mientras el backend no exista, el catálogo se sirve desde datos locales.
// Con 'api' se lee desde Nest (ApiCatalogSource).
export const CATALOG_SOURCE  = process.env.CATALOG_SOURCE === 'api' ? 'api' : 'mock';
// Proyectos, oficio y restauraciones: siguen locales hasta tener su módulo en el backend
export const CONTENT_SOURCE  = process.env.CONTENT_SOURCE === 'api' ? 'api' : 'mock';

// ─── Datos de contacto (confirmados por el cliente) ────────────────────────────

export const WHATSAPP_NUMBER  = '573163032999';
export const WHATSAPP_DISPLAY = '316 303 2999';
export const PHONE_LANDLINE   = '605 580 1768';
export const CONTACT_EMAIL    = 'forjashierrohechoarte@gmail.com';
export const ADDRESS          = 'Carrera 7 #13-37, Valledupar, Cesar';
export const INSTAGRAM_URL    = 'https://www.instagram.com/forjas_vpar/';
export const INSTAGRAM_HANDLE = '@forjas_vpar';
