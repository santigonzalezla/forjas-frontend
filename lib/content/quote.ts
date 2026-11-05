
export interface QuoteType
{
    id:        string;
    label:     string;
    hint:      string;
    measures:  boolean;
}

export const QUOTE_TYPES: QuoteType[] = [
    {id: 'gate',        label: 'Portón',                  hint: 'Peatonal, vehicular, corredizo o batiente', measures: true},
    {id: 'door',        label: 'Puerta',                  hint: 'De acceso, en hierro o hierro y vidrio',    measures: true},
    {id: 'window',      label: 'Reja o protector',        hint: 'Para ventanas y balcones',                  measures: true},
    {id: 'railing',     label: 'Baranda',                 hint: 'Escaleras, balcones y terrazas',            measures: true},
    {id: 'furniture',   label: 'Mueble a medida',         hint: 'Mesas, sillas, butacos, lámparas',          measures: true},
    {id: 'restoration', label: 'Restauración de mueble',  hint: 'Envíanos fotos del mueble como está',       measures: false},
    {id: 'structure',   label: 'Estructura o fachada',    hint: 'Marquesinas, cerramientos, fachadas',       measures: true},
    {id: 'other',       label: 'Otro trabajo',            hint: 'Cuéntanos qué tienes en mente',             measures: false},
];

const PIECE_HINTS: [RegExp, string][] = [
    [/porton/,             'gate'],
    [/puerta/,             'door'],
    [/reja|protector/,     'window'],
    [/baranda|escalera/,   'railing'],
    [/cerramiento|fachada/, 'structure'],
];

export const guessTypeFromPiece = (slug: string): string | undefined =>
    PIECE_HINTS.find(([pattern]) => pattern.test(slug))?.[1];
