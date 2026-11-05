const dateFormatter     = new Intl.DateTimeFormat('es-CO', {day: 'numeric', month: 'short', year: 'numeric'});
const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'});

// Fechas en formato colombiano corto: "5 nov 2026" y "5 nov, 7:15 a. m."
export const formatDate     = (iso: string): string => dateFormatter.format(new Date(iso));
export const formatDateTime = (iso: string): string => dateTimeFormatter.format(new Date(iso));

// Fecha sin hora (YYYY-MM-DD) tal como se eligió, sin correrla por zona horaria
export const formatDay = (iso: string): string =>
{
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
};
