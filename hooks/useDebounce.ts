'use client';

import {useEffect, useState} from 'react';

// Devuelve el valor después de que deja de cambiar durante `delay` ms (búsquedas)
export function useDebounce<T>(value: T, delay = 300): T
{
    const [debounced, setDebounced] = useState(value);

    useEffect(() =>
    {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
