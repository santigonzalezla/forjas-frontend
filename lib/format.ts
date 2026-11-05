const copFormatter = new Intl.NumberFormat('es-CO', {maximumFractionDigits: 0});

// Formato colombiano: $1.250.000
export const formatCOP = (value: number): string => `$${copFormatter.format(value)}`;

// Número de pieza con dos dígitos para el hero: 1 → "01"
export const padNumber = (value: number): string => String(value).padStart(2, '0');
