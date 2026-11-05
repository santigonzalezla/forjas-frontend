'use client';

import {useRef, type ReactNode} from 'react';
import {useReveal} from '@/hooks/useReveal';

// Aplica las animaciones de aparición solo dentro de su contenido y después de que
// ese contenido hidrató. Se usa en páginas que llegan por streaming (Suspense).
const RevealScope = ({children}: {children: ReactNode}) =>
{
    const ref = useRef<HTMLDivElement>(null);
    useReveal(ref);
    return <div ref={ref}>{children}</div>;
};

export default RevealScope;
