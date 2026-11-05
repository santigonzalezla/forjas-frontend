const copFormatter = new Intl.NumberFormat('es-CO', {maximumFractionDigits: 0});

export const formatCOP = (value: number): string => `$${copFormatter.format(value)}`;

export const padNumber = (value: number): string => String(value).padStart(2, '0');
