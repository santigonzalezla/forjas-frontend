import type {MediaImage} from '@/app/interfaces/interfaces';

export interface Milestone
{
    id:    string;
    year?: string;
    text:  string;
    image: MediaImage;
}

export interface TeamMember
{
    name: string;
    role: string;
}

const img = (file: string, alt: string, width: number, height: number): MediaImage => ({src: `/img/${file}.webp`, alt, width, height});

export const MILESTONES: Milestone[] = [
    {
        id:    'inicio',
        year:  '1997',
        text:  'La familia Losada Castro deja el negocio agropecuario, vende sus fincas y crea Forjas en Valledupar.',
        image: img('espiral', 'Detalle de una espiral de hierro forjado sobre madera', 1200, 1600),
    },
    {
        id:    'ornamentacion',
        text:  'Portones, rejas y barandas para casas y negocios del Cesar y La Guajira.',
        image: img('porton-colonial', 'Portón y cerramiento en hierro forjado con volutas', 1030, 700),
    },
    {
        id:    'inox',
        text:  'Llega el acero inoxidable: barandas en platina y tubería.',
        image: img('escalera-inox', 'Escalera con baranda en acero inoxidable', 770, 1280),
    },
    {
        id:    'restauracion',
        year:  '2016',
        text:  'Empezamos a restaurar muebles antiguos.',
        image: img('restauracion-silla-despues', 'Silla restaurada en blanco envejecido con tapizado nuevo', 800, 1000),
    },
    {
        id:    'hoy',
        year:  'Hoy',
        text:  'Muebles con acero reciclado de tanques de combustible, y diseño de piezas en 3D desde esta página.',
        image: img('sofa-tanque', 'Sofá hecho con un tanque de combustible reciclado', 1200, 1600),
    },
];

export const TEAM: TeamMember[] = [
    {name: 'Omar Losada Monje', role: 'Gerente y forjador'},
    {name: 'Dolly Castro',      role: 'Artista'},
    {name: 'Patricia E. Losada', role: 'Arquitecta y diseñadora'},
];
