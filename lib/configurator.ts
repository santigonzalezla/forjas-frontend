import {FINISHES, findFinish, type FinishId} from '@/lib/finishes';
import {PALETTE, findColor, type PaletteId} from '@/lib/palette';

export type Family       = 'ornamental' | 'furniture' | 'decor';
export type PieceType    = 'gate' | 'door' | 'window' | 'railing' | 'nest' | 'stool' | 'armchair' | 'chandelier' | 'lantern' | 'bicycle' | 'tiered';
export type Style        = 'minimal' | 'modern' | 'colonial' | 'baroque' | 'laser';
export type LaserMotif   = 'foliage' | 'vines' | 'lattice' | 'geometric' | 'waves';
export type Ornament     = 'scrolls' | 'hearts' | 'rings' | 'twisted' | 'collars' | 'spears' | 'balls' | 'plate' | 'rosette' | 'arch';
export type Extra        = 'motor' | 'lock';
export type Size         = 'small' | 'medium' | 'large';
export type Pattern      = 'solid' | 'stripes' | 'art';
export type DesignFinish = FinishId | 'pintado';
export type Cushion      = 'plain' | 'print';

export interface Design
{
    type:      PieceType;
    widthCm:   number;
    heightCm:  number;
    style:     Style;
    ornaments: Ornament[];
    finish:    DesignFinish;
    extras:    Extra[];
    size:      Size;
    pattern:   Pattern;
    colors:    {frame: PaletteId; accent: PaletteId};
    cushion:   Cushion;
    laserMotif: LaserMotif;
}

interface Range
{
    min:     number;
    max:     number;
    default: number;
}

export interface SizeOption
{
    id:       Size;
    label:    string;
    hint:     string;
    widthCm:  number;
    heightCm: number;
}

export interface PieceOption
{
    id:           PieceType;
    family:       Family;
    label:        string;
    hint:         string;
    width:        Range;
    height:       Range;
    widthLabel:   string;
    sizes?:       SizeOption[];
    patterns?:    Pattern[];
    accentLabel?: string;
    namedSizes?:  boolean;
    cushions?:    boolean;
}

const fixed = (value: number): Range => ({min: value, max: value, default: value});

export const PIECES: PieceOption[] = [
    {id: 'gate',    family: 'ornamental', label: 'Portón',           hint: 'Una o dos hojas',           width: {min: 100, max: 800,  default: 320}, height: {min: 120, max: 350, default: 210}, widthLabel: 'Ancho'},
    {id: 'door',    family: 'ornamental', label: 'Puerta',           hint: 'Acceso peatonal',           width: {min: 70,  max: 200,  default: 100}, height: {min: 180, max: 300, default: 220}, widthLabel: 'Ancho'},
    {id: 'window',  family: 'ornamental', label: 'Reja o protector', hint: 'Para ventana',              width: {min: 50,  max: 300,  default: 120}, height: {min: 50,  max: 250, default: 120}, widthLabel: 'Ancho'},
    {id: 'railing', family: 'ornamental', label: 'Baranda',          hint: 'Balcón, terraza, escalera', width: {min: 100, max: 1200, default: 300}, height: {min: 80,  max: 120, default: 95},  widthLabel: 'Largo'},
    {
        id: 'nest', family: 'furniture', label: 'Mesas nido', hint: 'Juego de tres mesas', width: fixed(55), height: fixed(58), widthLabel: 'Ancho',
        accentLabel: 'Tableros', patterns: ['solid', 'stripes', 'art'],
        sizes: [
            {id: 'small',  label: 'Pequeñas', hint: 'La mayor de 45 × 50 cm', widthCm: 45, heightCm: 50},
            {id: 'medium', label: 'Medianas', hint: 'La mayor de 55 × 58 cm', widthCm: 55, heightCm: 58},
            {id: 'large',  label: 'Grandes',  hint: 'La mayor de 65 × 65 cm', widthCm: 65, heightCm: 65},
        ],
    },
    {
        id: 'stool', family: 'furniture', label: 'Butaco', hint: 'Asiento redondo pintado', width: fixed(35), height: fixed(45), widthLabel: 'Diámetro',
        accentLabel: 'Asiento', patterns: ['solid', 'stripes', 'art'],
        sizes: [
            {id: 'small',  label: 'Bajo',   hint: '45 cm de alto', widthCm: 34, heightCm: 45},
            {id: 'medium', label: 'Cocina', hint: '65 cm de alto', widthCm: 36, heightCm: 65},
            {id: 'large',  label: 'Barra',  hint: '75 cm de alto', widthCm: 38, heightCm: 75},
        ],
    },
    {
        id: 'armchair', family: 'furniture', label: 'Poltrona o sofá tanque', hint: 'Acero reciclado de tanque', width: fixed(58), height: fixed(88), widthLabel: 'Ancho',
        accentLabel: 'Tanque', patterns: ['solid'], namedSizes: true, cushions: true,
        sizes: [
            {id: 'small',  label: 'Poltrona',       hint: 'Un puesto, tanque vertical', widthCm: 58,  heightCm: 88},
            {id: 'medium', label: 'Sofá 2 puestos', hint: '160 cm de largo',            widthCm: 160, heightCm: 66},
            {id: 'large',  label: 'Sofá 3 puestos', hint: '230 cm de largo',            widthCm: 230, heightCm: 66},
        ],
    },
    {
        id: 'chandelier', family: 'decor', label: 'Lámpara de rueda', hint: 'Colgante con brazos en voluta', width: fixed(80), height: fixed(100), widthLabel: 'Diámetro',
        accentLabel: 'Radios', patterns: ['solid'],
        sizes: [
            {id: 'small',  label: '4 brazos', hint: '60 cm de diámetro',  widthCm: 60,  heightCm: 90},
            {id: 'medium', label: '6 brazos', hint: '80 cm de diámetro',  widthCm: 80,  heightCm: 100},
            {id: 'large',  label: '8 brazos', hint: '100 cm de diámetro', widthCm: 100, heightCm: 110},
        ],
    },
    {
        id: 'lantern', family: 'decor', label: 'Farol colgante', hint: 'Hierro y vidrio, techo piramidal', width: fixed(30), height: fixed(70), widthLabel: 'Ancho',
        accentLabel: 'Techo', patterns: ['solid'],
        sizes: [
            {id: 'small',  label: 'Pequeño', hint: '22 cm de lado', widthCm: 22, heightCm: 60},
            {id: 'medium', label: 'Mediano', hint: '30 cm de lado', widthCm: 30, heightCm: 70},
            {id: 'large',  label: 'Grande',  hint: '38 cm de lado', widthCm: 38, heightCm: 82},
        ],
    },
    {
        id: 'bicycle', family: 'decor', label: 'Matera bicicleta', hint: 'Con canasta y portamatera', width: fixed(100), height: fixed(95), widthLabel: 'Largo',
        accentLabel: 'Matera', patterns: ['solid'],
        sizes: [
            {id: 'small',  label: 'Pequeña', hint: '80 cm de largo',  widthCm: 80,  heightCm: 76},
            {id: 'medium', label: 'Mediana', hint: '100 cm de largo', widthCm: 100, heightCm: 95},
            {id: 'large',  label: 'Grande',  hint: '120 cm de largo', widthCm: 120, heightCm: 114},
        ],
    },
    {
        id: 'tiered', family: 'decor', label: 'Escalera de materas', hint: 'Tres niveles con volutas', width: fixed(70), height: fixed(95), widthLabel: 'Ancho',
        accentLabel: 'Materas', patterns: ['solid'],
        sizes: [
            {id: 'small',  label: 'Pequeña', hint: '75 cm de alto',  widthCm: 56, heightCm: 75},
            {id: 'medium', label: 'Mediana', hint: '95 cm de alto',  widthCm: 70, heightCm: 95},
            {id: 'large',  label: 'Grande',  hint: '115 cm de alto', widthCm: 84, heightCm: 115},
        ],
    },
];

export const FAMILIES: {id: Family; label: string}[] = [
    {id: 'ornamental', label: 'Ornamentación'},
    {id: 'furniture',  label: 'Muebles'},
    {id: 'decor',      label: 'Decoración e iluminación'},
];

export const STEPS: Record<Family, string[]> = {
    ornamental: ['Pieza', 'Medidas', 'Estilo', 'Acabado', 'Enviar'],
    furniture:  ['Pieza', 'Tamaño', 'Diseño', 'Estructura', 'Enviar'],
    decor:      ['Pieza', 'Tamaño', 'Diseño', 'Estructura', 'Enviar'],
};

export const STYLES: {id: Style; label: string; hint: string}[] = [
    {id: 'minimal',  label: 'Minimalista', hint: 'Barrotes rectos y limpios'},
    {id: 'modern',   label: 'Moderno',     hint: 'Platinas horizontales'},
    {id: 'colonial', label: 'Colonial',    hint: 'Franja de motivos arriba'},
    {id: 'baroque',  label: 'Barroco',     hint: 'Franjas arriba y abajo'},
    {id: 'laser',    label: 'Corte láser', hint: 'Lámina calada con diseño'},
];

export const LASER_MOTIFS: {id: LaserMotif; label: string; hint: string}[] = [
    {id: 'foliage',   label: 'Follaje',    hint: 'Ramas y hojas en gota'},
    {id: 'vines',     label: 'Enredadera', hint: 'Tallos en espiral con hojas'},
    {id: 'lattice',   label: 'Celosía',    hint: 'Trébol de cuatro hojas, estilo árabe'},
    {id: 'geometric', label: 'Geométrico', hint: 'Rombos y cuadros'},
    {id: 'waves',     label: 'Olas',       hint: 'Franjas onduladas'},
];

export type OrnamentGroup = 'band' | 'bar' | 'finial' | 'detail';

export const ORNAMENTS: {id: Ornament; label: string; group: OrnamentGroup; notFor?: PieceType[]}[] = [
    {id: 'hearts',  label: 'Corazones',          group: 'band'},
    {id: 'scrolls', label: 'Volutas',            group: 'band'},
    {id: 'rings',   label: 'Anillos',            group: 'band'},
    {id: 'twisted', label: 'Barrotes torcidos',  group: 'bar'},
    {id: 'collars', label: 'Collarines dorados', group: 'bar'},
    {id: 'spears',  label: 'Lanzas',             group: 'finial'},
    {id: 'balls',   label: 'Remate de bola',     group: 'finial'},
    {id: 'plate',   label: 'Lámina inferior',    group: 'detail', notFor: ['railing']},
    {id: 'rosette', label: 'Roseta central',     group: 'detail'},
    {id: 'arch',    label: 'Remate en arco',     group: 'detail', notFor: ['railing']},
];

export const ORNAMENT_GROUPS: {id: OrnamentGroup; label: string; hint?: string}[] = [
    {id: 'band',   label: 'Franjas decorativas', hint: 'La primera va arriba; la segunda, abajo.'},
    {id: 'bar',    label: 'Barrotes'},
    {id: 'finial', label: 'Remate de los barrotes'},
    {id: 'detail', label: 'Detalles'},
];

export const EXTRAS: {id: Extra; label: string; onlyFor?: PieceType[]}[] = [
    {id: 'motor', label: 'Motor eléctrico', onlyFor: ['gate']},
    {id: 'lock',  label: 'Cerradura de seguridad', onlyFor: ['gate', 'door', 'window', 'railing']},
];

export const PATTERNS: {id: Pattern; label: string; hint: string}[] = [
    {id: 'solid',   label: 'Liso',    hint: 'Un solo color'},
    {id: 'stripes', label: 'Franjas', hint: 'Tablillas de colores, como las mesas nido'},
    {id: 'art',     label: 'Arte',    hint: 'Pintado a mano, como el butaco'},
];

export const FINISH_IDS: DesignFinish[] = [...FINISHES.map(finish => finish.id), 'pintado'];

export const findPiece = (type: PieceType): PieceOption => PIECES.find(piece => piece.id === type) ?? PIECES[0];
export const familyOf  = (type: PieceType): Family => findPiece(type).family;
export const isFurniture = (type: PieceType) => familyOf(type) !== 'ornamental';

export const finishLabel = (design: Design): string =>
    design.finish === 'pintado' ? `pintado ${findColor(design.colors.frame).label.toLowerCase()}` : findFinish(design.finish).label;

const clamp = (value: number, {min, max}: Range) => Math.min(max, Math.max(min, Math.round(value)));

export const isOrnamentAllowed = (ornament: Ornament, type: PieceType, style?: Style) =>
    !isFurniture(type) && (style !== 'laser' || ornament === 'arch') && !ORNAMENTS.find(o => o.id === ornament)?.notFor?.includes(type);
export const isExtraAllowed    = (extra: Extra, type: PieceType) => !!EXTRAS.find(e => e.id === extra)?.onlyFor?.includes(type);

export const toggleOrnament = (list: Ornament[], ornament: Ornament): Ornament[] =>
{
    if (list.includes(ornament)) return list.filter(o => o !== ornament);
    const group = ORNAMENTS.find(o => o.id === ornament)?.group;
    const rest  = group === 'finial' ? list.filter(o => ORNAMENTS.find(x => x.id === o)?.group !== 'finial') : list;
    return [...rest, ornament];
};

export const normalizeDesign = (design: Design): Design =>
{
    const piece = findPiece(design.type);
    const size  = piece.sizes?.find(s => s.id === design.size) ?? piece.sizes?.[Math.min(1, (piece.sizes?.length ?? 1) - 1)];

    const ornaments = [...new Set(design.ornaments)].filter(o => isOrnamentAllowed(o, design.type, design.style));
    const finials   = ornaments.filter(o => ORNAMENTS.find(x => x.id === o)?.group === 'finial');

    return {
        ...design,
        widthCm:   size ? size.widthCm : clamp(design.widthCm, piece.width),
        heightCm:  size ? size.heightCm : clamp(design.heightCm, piece.height),
        size:      size?.id ?? design.size,
        pattern:   piece.patterns?.includes(design.pattern) ? design.pattern : (piece.patterns?.[0] ?? 'solid'),
        ornaments: finials.length > 1 ? ornaments.filter(o => o !== finials[0]) : ornaments,
        extras:    [...new Set(design.extras)].filter(e => isExtraAllowed(e, design.type)),
    };
};

const PRESETS: Partial<Record<PieceType, Partial<Design>>> = {
    nest:     {finish: 'negro',   pattern: 'stripes', colors: {frame: 'negro-mate', accent: 'rojo'}},
    stool:    {finish: 'pintado', pattern: 'art',     colors: {frame: 'celeste',    accent: 'morado'}},
    armchair: {finish: 'negro',   pattern: 'solid',   colors: {frame: 'negro-mate', accent: 'morado'}, size: 'small', cushion: 'print'},
    chandelier: {finish: 'negro',   colors: {frame: 'negro-mate', accent: 'amarillo'}},
    lantern:    {finish: 'negro',   colors: {frame: 'negro-mate', accent: 'negro-mate'}},
    bicycle:    {finish: 'pintado', colors: {frame: 'blanco',     accent: 'naranja'}},
    tiered:     {finish: 'pintado', colors: {frame: 'turquesa',   accent: 'naranja'}},
};

export const defaultDesign = (type: PieceType = 'gate'): Design =>
{
    const piece = findPiece(type);
    return normalizeDesign({
        type,
        widthCm:   piece.width.default,
        heightCm:  piece.height.default,
        style:     'colonial',
        ornaments: type === 'railing' ? ['scrolls'] : ['hearts', 'spears'],
        finish:    'negro',
        extras:    [],
        size:      'medium',
        pattern:   'solid',
        colors:    {frame: 'negro-mate', accent: 'rojo'},
        cushion:   'plain',
        laserMotif: 'foliage',
        ...PRESETS[type],
    });
};

export const changeType = (design: Design, type: PieceType): Design =>
{
    if (familyOf(design.type) !== familyOf(type)) return defaultDesign(type);
    const piece = findPiece(type);
    return normalizeDesign({...design, ...PRESETS[type], type, widthCm: piece.width.default, heightCm: piece.height.default, size: PRESETS[type]?.size ?? 'medium'});
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const oneOf = <T extends string>(value: string | undefined, options: readonly T[]): T | undefined =>
    options.includes(value as T) ? value as T : undefined;
const listOf = <T extends string>(value: string | undefined, options: readonly T[]): T[] | undefined =>
    value === undefined ? undefined : value.split(',').filter((item): item is T => options.includes(item as T));

const PALETTE_IDS = PALETTE.map(color => color.id);

export const parseDesign = (params: Params, fallbackType?: PieceType, preset: Partial<Design> = {}): Design =>
{
    const type = oneOf(first(params.type), PIECES.map(p => p.id)) ?? fallbackType ?? 'gate';
    const base = type === fallbackType ? normalizeDesign({...defaultDesign(type), ...preset}) : defaultDesign(type);
    const w    = Number(first(params.w));
    const h    = Number(first(params.h));

    return normalizeDesign({
        type,
        widthCm:   Number.isFinite(w) && w > 0 ? w : base.widthCm,
        heightCm:  Number.isFinite(h) && h > 0 ? h : base.heightCm,
        style:     oneOf(first(params.style), STYLES.map(s => s.id)) ?? base.style,
        ornaments: listOf(first(params.orn), ORNAMENTS.map(o => o.id)) ?? base.ornaments,
        finish:    oneOf(first(params.finish), FINISH_IDS) ?? base.finish,
        extras:    listOf(first(params.extras), EXTRAS.map(e => e.id)) ?? base.extras,
        size:      oneOf(first(params.size), ['small', 'medium', 'large'] as const) ?? base.size,
        pattern:   oneOf(first(params.pattern), PATTERNS.map(p => p.id)) ?? base.pattern,
        colors:    {
            frame:  oneOf(first(params.frame), PALETTE_IDS) ?? base.colors.frame,
            accent: oneOf(first(params.accent), PALETTE_IDS) ?? base.colors.accent,
        },
        cushion:   oneOf(first(params.cushion), ['plain', 'print'] as const) ?? base.cushion,
        laserMotif: oneOf(first(params.laser), LASER_MOTIFS.map(m => m.id)) ?? base.laserMotif,
    });
};

export const designToQuery = (design: Design): string =>
{
    const query = new URLSearchParams({type: design.type});

    if (isFurniture(design.type))
    {
        query.set('size', design.size);
        query.set('pattern', design.pattern);
        query.set('accent', design.colors.accent);
        if (findPiece(design.type).cushions) query.set('cushion', design.cushion);
    }
    else
    {
        query.set('w', String(design.widthCm));
        query.set('h', String(design.heightCm));
        query.set('style', design.style);
        query.set('orn', design.ornaments.join(','));
        if (design.style === 'laser') query.set('laser', design.laserMotif);
        query.set('extras', design.extras.join(','));
    }

    query.set('finish', design.finish);
    if (design.finish === 'pintado') query.set('frame', design.colors.frame);
    return query.toString();
};

export const designPayload = (design: Design) =>
    isFurniture(design.type)
        ? {...design, ornaments: [], extras: [], laserMotif: undefined, cushion: findPiece(design.type).cushions ? design.cushion : undefined}
        : {
            ...design, size: undefined, pattern: undefined, cushion: undefined,
            laserMotif: design.style === 'laser' ? design.laserMotif : undefined,
            colors:     design.finish === 'pintado' ? {frame: design.colors.frame} : undefined,
        };

export const describeDesign = (design: Design): string =>
{
    const piece = findPiece(design.type);

    if (piece.family !== 'ornamental')
    {
        const size    = piece.sizes?.find(s => s.id === design.size);
        const pattern = PATTERNS.find(p => p.id === design.pattern)?.label.toLowerCase();
        const accent  = design.pattern === 'solid' ? ` ${findColor(design.colors.accent).label.toLowerCase()}` : '';
        const name = piece.namedSizes && size ? `${size.label} en tanque reciclado` : `${piece.label}${size ? ` ${size.label.toLowerCase()}` : ''}`;
        return [
            name,
            piece.patterns && piece.patterns.length > 1 ? `${piece.accentLabel?.toLowerCase() ?? 'pintura'} ${pattern}${accent}` : `${piece.accentLabel?.toLowerCase() ?? 'pintura'}${accent}`,
            piece.cushions && `cojín ${design.cushion === 'print' ? 'estampado' : 'blanco'}`,
            `estructura ${finishLabel(design).toLowerCase()}`,
        ].filter(Boolean).join('; ');
    }

    const style     = design.style === 'laser'
        ? `en corte láser (${LASER_MOTIFS.find(m => m.id === design.laserMotif)?.label.toLowerCase() ?? design.laserMotif})`
        : (STYLES.find(s => s.id === design.style)?.label ?? design.style).toLowerCase();
    const ornaments = design.ornaments.map(id => ORNAMENTS.find(o => o.id === id)?.label).filter(Boolean).join(', ');
    const extras    = design.extras.map(id => EXTRAS.find(e => e.id === id)?.label).filter(Boolean).join(', ');

    return [
        `${piece.label} ${style}, ${design.widthCm} × ${design.heightCm} cm`,
        `acabado ${finishLabel(design).toLowerCase()}`,
        ornaments && `motivos: ${ornaments.toLowerCase()}`,
        extras && `extras: ${extras.toLowerCase()}`,
    ].filter(Boolean).join('; ');
};

const SLUG_TO_PIECE: [RegExp, PieceType][] = [
    [/lampara/,                    'chandelier'],
    [/farol/,                      'lantern'],
    [/matera-bicicleta|bicicleta/, 'bicycle'],
    [/matera/,                     'tiered'],
    [/mesas-nido/,                 'nest'],
    [/butaco/,                     'stool'],
    [/poltrona|sofa/,              'armchair'],
    [/porton|cerramiento/,         'gate'],
    [/puerta/,                     'door'],
    [/reja|protector|ventana/,     'window'],
    [/baranda|escalera/,           'railing'],
];

export const pieceForSlug = (slug: string): PieceType | undefined => SLUG_TO_PIECE.find(([pattern]) => pattern.test(slug))?.[1];

const SLUG_PRESETS: [RegExp, Partial<Design>][] = [
    [/sofa/,               {size: 'medium', colors: {frame: 'negro-mate', accent: 'rojo'}, cushion: 'plain'}],
    [/poltrona/,           {size: 'small',  colors: {frame: 'negro-mate', accent: 'rojo'}, cushion: 'plain'}],
    [/inox|baranda-escalera/, {finish: 'inox', style: 'minimal', ornaments: []}],
    [/mesas-nido-color/,   {pattern: 'stripes'}],
    [/^mesas-nido$/,       {pattern: 'solid', colors: {frame: 'negro-mate', accent: 'negro-mate'}}],
];

export const presetForSlug = (slug: string): Partial<Design> =>
    Object.assign({}, ...SLUG_PRESETS.filter(([pattern]) => pattern.test(slug)).map(([, preset]) => preset));
