'use client';

import {useReveal} from '@/hooks/useReveal';

// Activa las animaciones de aparición de la página. Se monta una vez por página.
const RevealRoot = () =>
{
    useReveal();
    return null;
};

export default RevealRoot;
