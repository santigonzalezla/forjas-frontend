import type {MediaImage} from '@/app/interfaces/interfaces';

export interface Service
{
    id:      string;
    title:   string;
    intro:   string;
    items:   string[];
    image:   MediaImage;
    cta:     {href: string; label: string};
}

const img = (file: string, alt: string, width: number, height: number): MediaImage => ({src: `/img/${file}.webp`, alt, width, height});

export const SERVICES: Service[] = [
    {
        id:    'ornamentacion',
        title: 'Ornamentación a medida',
        intro: 'Rejas, protectores, puertas, portones y barandas para casas y negocios, forjados en caliente o en frío según la pieza.',
        items: ['Portones y puertas', 'Rejas y protectores de ventana', 'Barandas para escaleras y balcones', 'Barandas en acero inoxidable, en platina y tubería'],
        image: img('porton-colonial', 'Portón y cerramiento en hierro forjado con volutas', 1030, 700),
        cta:   {href: '/design', label: 'Diseñar en 3D'},
    },
    {
        id:    'muebles',
        title: 'Muebles en hierro forjado',
        intro: 'Mesas, sillas, butacos, tinajeros y juegos de terraza para interior y exterior, en hierro solo o combinado con madera.',
        items: ['Juegos de terraza y comedores', 'Butacos, mesas auxiliares y mesas nido', 'Lámparas, faroles y centros de mesa', 'Acabados natural, oxidado o vintage'],
        image: img('juego-terraza', 'Juego de terraza bistró en hierro forjado', 1600, 1200),
        cta:   {href: '/shop', label: 'Ver la tienda'},
    },
    {
        id:    'restauracion',
        title: 'Restauración de muebles antiguos',
        intro: 'Desde 2016 devolvemos la vida a muebles con historia: estructura, pintura y tapizado, respetando la pieza original.',
        items: ['Recuperación de estructura', 'Pintura y acabados envejecidos', 'Tapizado nuevo', 'Cotización a partir de fotos'],
        image: img('restauracion-silla-despues', 'Silla restaurada en blanco envejecido con tapizado nuevo', 800, 1000),
        cta:   {href: '/quote?type=restoration', label: 'Enviar fotos para cotizar'},
    },
    {
        id:    'estructuras',
        title: 'Estructuras en hierro y acero',
        intro: 'Estructuras metálicas, marquesinas y fachadas para locales y viviendas.',
        items: ['Estructuras metálicas', 'Marquesinas y fachadas comerciales', 'Cerramientos', 'Visita técnica para medir'],
        image: img('fachada-tortas', 'Fachada comercial con estructura y ornamentación en hierro', 866, 867),
        cta:   {href: '/quote?type=structure', label: 'Agendar visita técnica'},
    },
    {
        id:    'reciclada',
        title: 'Línea reciclada',
        intro: 'Muebles hechos con el acero de tanques que transportaron gasolina y aceite: piezas únicas que le dan una segunda vida al metal.',
        items: ['Sofás y poltronas', 'Cada pieza es irrepetible', 'Acabados a tu gusto'],
        image: img('sofa-tanque', 'Sofá hecho con un tanque de combustible reciclado', 1200, 1600),
        cta:   {href: '/shop?category=linea-reciclada', label: 'Ver la línea'},
    },
];
