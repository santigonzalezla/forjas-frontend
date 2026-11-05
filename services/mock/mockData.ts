import {ProductCategory, ProductType} from '@/app/interfaces/enums';
import type {CraftStep, FeaturedPiece, MediaImage, Product, Project, Restoration} from '@/app/interfaces/interfaces';

const img = (file: string, alt: string, width: number, height: number): MediaImage => ({
    src: `/img/${file}.webp`,
    alt,
    width,
    height,
});

const IMAGES = {
    portonColonial:    img('porton-colonial',    'Portón y cerramiento en hierro forjado con volutas',        1030, 700),
    mesasNido:         img('mesas-nido',         'Mesas nido en hierro forjado con patas en espiral',          630, 1010),
    barandaInox:       img('baranda-inox',       'Baranda de escalera en acero inoxidable',                    1278, 913),
    barandaInox2:      img('baranda-inox-2',     'Baranda en acero inoxidable instalada en una terraza',       1280, 960),
    escaleraInox:      img('escalera-inox',      'Escalera con baranda en acero inoxidable',                   770, 1280),
    puertaHierro:      img('puerta-hierro',      'Puerta en hierro forjado y vidrio',                          698, 903),
    fachadaMarquesina: img('fachada-marquesina', 'Fachada con marquesina y puerta de acceso en hierro',        770, 1280),
    fachadaTortas:     img('fachada-tortas',     'Fachada comercial con estructura y ornamentación en hierro', 866, 867),
    cerramiento:       img('cerramiento',        'Cerramiento metálico instalado en un jardín',                960, 1280),
    juegoTerraza:      img('juego-terraza',      'Juego de terraza bistró en hierro forjado',                  1600, 1200),
    sofaTanque:        img('sofa-tanque',        'Sofá hecho con un tanque de combustible reciclado',          1200, 1600),
    sillaTanque:       img('silla-tanque',       'Poltrona hecha con un tanque reciclado',                     1600, 899),
    butaco:            img('butaco',             'Butaco en hierro con asiento pintado',                       1200, 1600),
    materaBicicleta:   img('matera-bicicleta',   'Matera en forma de bicicleta en hierro pintado',             1200, 1600),
    lamparaColgante:   img('lampara-colgante',   'Lámpara colgante en hierro forjado',                         810, 915),
    mesasColor:        img('mesas-color',        'Mesas nido en hierro con tableros de colores',               720, 1280),
    espiral:           img('espiral',            'Detalle de una espiral de hierro forjado sobre madera',      1200, 1600),
};

const product = (
    id: string, name: string, detail: string, type: ProductType,
    category: ProductCategory, price: number | null, image: MediaImage,
): Product => ({id, slug: id, name, detail, type, category, price, image});

const C = ProductCategory;
const T = ProductType;

export const MOCK_PRODUCTS = {
    porton:      product('porton-a-medida',      'Portón a medida',             'Hierro forjado',            T.CONFIGURABLE, C.ORNAMENTAL, null,    IMAGES.portonColonial),
    cerramiento: product('cerramiento',          'Cerramiento',                 'Hierro y lámina',           T.QUOTE,        C.ORNAMENTAL, null,    IMAGES.cerramiento),
    baranda:     product('baranda-inox',         'Baranda en acero inoxidable', 'Platina y tubería',         T.CONFIGURABLE, C.ORNAMENTAL, null,    IMAGES.barandaInox),
    escalera:    product('baranda-escalera',     'Baranda para escalera',       'Acero inoxidable',          T.CONFIGURABLE, C.ORNAMENTAL, null,    IMAGES.escaleraInox),
    terraza:     product('juego-terraza-bistro', 'Juego de terraza bistró',     'Hierro forjado, 4 puestos', T.CATALOG,      C.FURNITURE,  1850000, IMAGES.juegoTerraza),
    butaco:      product('butaco-forjado',       'Butaco forjado',              'Hierro y asiento pintado',  T.CATALOG,      C.FURNITURE,  280000,  IMAGES.butaco),
    sofa:        product('sofa-tanque',          'Sofá Tanque',                 'Acero reciclado de tanque', T.CATALOG,      C.RECYCLED,   2400000, IMAGES.sofaTanque),
    poltrona:    product('poltrona-tanque',      'Poltrona Tanque',             'Acero reciclado de tanque', T.CATALOG,      C.RECYCLED,   1350000, IMAGES.sillaTanque),
    lampara:     product('lampara-colgante',     'Lámpara colgante',            'Hierro forjado',            T.CATALOG,      C.LIGHTING,   690000,  IMAGES.lamparaColgante),
    nido:        product('mesas-nido',           'Mesas nido',                  'Hierro forjado, par',       T.CATALOG,      C.FURNITURE,  520000,  IMAGES.mesasNido),
    nidoColor:   product('mesas-nido-color',     'Mesas nido de colores',       'Hierro y madera pintada',   T.CATALOG,      C.FURNITURE,  640000,  IMAGES.mesasColor),
    puerta:      product('puerta-forjada',       'Puerta en hierro forjado',    'Hierro y vidrio',           T.QUOTE,        C.ORNAMENTAL, null,    IMAGES.puertaHierro),
    matera:      product('matera-bicicleta',     'Matera bicicleta',            'Hierro pintado',            T.CATALOG,      C.DECOR,      390000,  IMAGES.materaBicicleta),
};

const P = MOCK_PRODUCTS;

export const MOCK_FEATURED_PIECES: FeaturedPiece[] = [
    {id: 'porton',   name: 'Portón colonial',             image: IMAGES.portonColonial,  products: [P.porton,  P.cerramiento]},
    {id: 'baranda',  name: 'Baranda en acero inoxidable', image: IMAGES.barandaInox,     products: [P.baranda, P.escalera]},
    {id: 'terraza',  name: 'Juego de terraza',            image: IMAGES.juegoTerraza,    products: [P.terraza, P.butaco]},
    {id: 'tanque',   name: 'Sofá de tanque reciclado',    image: IMAGES.sofaTanque,      products: [P.sofa,    P.poltrona]},
    {id: 'lampara',  name: 'Lámpara colgante',            image: IMAGES.lamparaColgante, products: [P.lampara, P.nido]},
    {id: 'puerta',   name: 'Puerta forjada',              image: IMAGES.puertaHierro,    products: [P.puerta,  P.matera]},
];

export const MOCK_SHOP_HIGHLIGHTS: Product[] = [
    P.butaco, P.terraza, P.nido, P.lampara, P.sofa, P.poltrona, P.nidoColor, P.matera,
];

export const MOCK_CRAFT_STEPS: CraftStep[] = [
    {
        id:    'diseno',
        title: 'Diseño',
        text:  'Cada pieza empieza en una conversación sobre tu espacio, con el acompañamiento de nuestra arquitecta diseñadora.',
        image: IMAGES.espiral,
    },
    {
        id:    'forja',
        title: 'Forja',
        text:  'Trabajamos el hierro en caliente o en frío, con fragua, yunque, tenazas y martillo, hasta darle la forma que queremos.',
        image: IMAGES.cerramiento,
    },
    {
        id:    'acabado',
        title: 'Acabado',
        text:  'Natural, oxidado o vintage. También trabajamos acero inoxidable en platina y tubería para barandas.',
        image: IMAGES.escaleraInox,
    },
    {
        id:    'instalacion',
        title: 'Instalación',
        text:  'Instalamos en Valledupar y alrededores, y enviamos piezas a todo el país.',
        image: IMAGES.barandaInox2,
    },
];

export const MOCK_RESTORATIONS: Restoration[] = [
    {
        id:          'silla-comedor',
        title:       'Silla de comedor',
        description: 'Llegó con la madera oscurecida y sin asiento. Se recuperó la estructura, se pintó en blanco envejecido y se tapizó de nuevo.',
        before:      img('restauracion-silla-antes',   'Silla de madera oscura y deteriorada antes de restaurar', 800, 1000),
        after:       img('restauracion-silla-despues', 'La misma silla restaurada en blanco envejecido con tapizado nuevo', 800, 1000),
    },
    {
        id:          'mecedora',
        title:       'Mecedora',
        description: 'Una mecedora clásica que pasó del blanco de base a una pieza pintada a mano, con color en cada detalle torneado.',
        before:      img('restauracion-mecedora-antes',   'Mecedora de madera pintada de blanco antes del trabajo', 700, 1000),
        after:       img('restauracion-mecedora-despues', 'La misma mecedora pintada a mano en verde, azul, rojo y amarillo', 700, 1000),
    },
];

export const MOCK_PROJECTS: Project[] = [
    {id: 'marquesina', slug: 'marquesina-y-puerta-de-acceso', title: 'Marquesina y puerta de acceso', type: 'Ornamentación',              summary: 'Marquesina en hierro con puerta de acceso.', image: IMAGES.fachadaMarquesina},
    {id: 'porton',     slug: 'porton-y-cerramiento',          title: 'Portón y cerramiento',          type: 'Ornamentación',              summary: 'Portón de doble hoja y cerramiento con volutas.', image: IMAGES.portonColonial},
    {id: 'comercial',  slug: 'fachada-comercial',             title: 'Fachada comercial',             type: 'Estructura y ornamentación', summary: 'Estructura y ornamentación para un negocio.', image: IMAGES.fachadaTortas},
    {id: 'puerta',     slug: 'puerta-en-hierro-y-vidrio',     title: 'Puerta en hierro y vidrio',     type: 'Ornamentación',              summary: 'Puerta de acceso en hierro forjado con vidrio.', image: IMAGES.puertaHierro},
    {id: 'baranda',    slug: 'baranda-en-acero-inoxidable',   title: 'Baranda en acero inoxidable',   type: 'Acero inoxidable',           summary: 'Baranda en platina y tubería de acero inoxidable.', image: IMAGES.barandaInox},
];
