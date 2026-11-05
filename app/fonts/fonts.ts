import {Fraunces, Instrument_Sans} from 'next/font/google';

// Titulares: serif suave, con calidez de oficio y tradición (eje SOFT redondea los remates)
const fraunces = Fraunces({
    subsets:  ['latin'],
    axes:     ['SOFT', 'opsz'],
    variable: '--font-fraunces',
    display:  'swap',
});

// Texto e interfaz: sans cálida y muy legible en móvil
const instrumentSans = Instrument_Sans({
    subsets:  ['latin'],
    weight:   ['400', '500', '600'],
    variable: '--font-instrument',
    display:  'swap',
});

export const fontVariables = `${fraunces.variable} ${instrumentSans.variable}`;
