import {Fraunces, Instrument_Sans} from 'next/font/google';

const fraunces = Fraunces({
    subsets:  ['latin'],
    axes:     ['SOFT', 'opsz'],
    variable: '--font-fraunces',
    display:  'swap',
});

const instrumentSans = Instrument_Sans({
    subsets:  ['latin'],
    weight:   ['400', '500', '600'],
    variable: '--font-instrument',
    display:  'swap',
});

export const fontVariables = `${fraunces.variable} ${instrumentSans.variable}`;
