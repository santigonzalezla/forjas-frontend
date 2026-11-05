'use client';

import {useRef, type ReactNode} from 'react';
import {useReveal} from '@/hooks/useReveal';

const RevealScope = ({children}: {children: ReactNode}) =>
{
    const ref = useRef<HTMLDivElement>(null);
    useReveal(ref);
    return <div ref={ref}>{children}</div>;
};

export default RevealScope;
