
export type PaletteId = 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'lima' | 'turquesa' | 'celeste' | 'azul' | 'morado' | 'blanco' | 'grafito' | 'negro-mate';

export interface PaletteColor
{
    id:    PaletteId;
    label: string;
    hex:   string;
}

export const PALETTE: PaletteColor[] = [
    {id: 'rojo',       label: 'Rojo tanque',       hex: '#b3202a'},
    {id: 'naranja',    label: 'Naranja',           hex: '#e0662a'},
    {id: 'amarillo',   label: 'Amarillo',          hex: '#f2c230'},
    {id: 'verde',      label: 'Verde',             hex: '#3f9b4a'},
    {id: 'lima',       label: 'Verde lima',        hex: '#9bc53d'},
    {id: 'turquesa',   label: 'Turquesa',          hex: '#2bb3c0'},
    {id: 'celeste',    label: 'Celeste',           hex: '#5aaee0'},
    {id: 'azul',       label: 'Azul rey',          hex: '#2450a8'},
    {id: 'morado',     label: 'Morado',            hex: '#6b3fa0'},
    {id: 'blanco',     label: 'Blanco envejecido', hex: '#efe9dc'},
    {id: 'grafito',    label: 'Gris grafito',      hex: '#4a4f55'},
    {id: 'negro-mate', label: 'Negro',             hex: '#1d1f21'},
];

export const findColor = (id: PaletteId): PaletteColor => PALETTE.find(color => color.id === id) ?? PALETTE[0];

export const MIX: PaletteId[] = ['rojo', 'amarillo', 'azul', 'verde', 'naranja', 'turquesa', 'morado', 'lima', 'celeste'];
