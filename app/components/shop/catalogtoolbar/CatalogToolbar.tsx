'use client';

import {useEffect, useRef, useState, useTransition} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import styles from './catalogtoolbar.module.css';
import {Search} from '@/app/components/svg';
import {useDebounce} from '@/hooks/useDebounce';
import type {CatalogSort} from '@/app/interfaces/interfaces';

const SORT_LABELS: Record<CatalogSort, string> = {
    'recommended': 'Recomendados',
    'price-asc':   'Precio: menor a mayor',
    'price-desc':  'Precio: mayor a menor',
    'newest':      'Más nuevos',
};

interface CatalogToolbarProps
{
    total:  number;
    search: string;
    sort:   CatalogSort;
}

// Búsqueda y orden actualizan la URL: el servidor vuelve a filtrar y el enlace se
// puede compartir tal cual.
const CatalogToolbar = ({total, search, sort}: CatalogToolbarProps) =>
{
    const router       = useRouter();
    const pathname     = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [term, setTerm] = useState(search);
    const debouncedTerm   = useDebounce(term, 350);

    const updateParams = (changes: Record<string, string | null>) =>
    {
        const next = new URLSearchParams(searchParams.toString());
        Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
        next.delete('page'); // cualquier filtro nuevo vuelve a la primera página
        startTransition(() => router.replace(`${pathname}?${next.toString()}`, {scroll: false}));
    };

    // El botón de búsqueda del header llega con #buscar: el campo queda listo para escribir
    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() =>
    {
        if (window.location.hash === '#buscar') searchRef.current?.focus();
    }, []);

    useEffect(() =>
    {
        if (debouncedTerm.trim() === search) return;
        updateParams({q: debouncedTerm.trim() || null});
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo reacciona al texto escrito
    }, [debouncedTerm]);

    return (
        <div className={styles.toolbar} data-pending={isPending}>
            <p className={styles.count} aria-live="polite">{total} {total === 1 ? 'pieza' : 'piezas'}</p>

            <label className={styles.search}>
                <Search />
                <span className="visuallyHidden">Buscar en la tienda</span>
                <input id="buscar" ref={searchRef} type="search" placeholder="Buscar piezas" aria-label="Buscar piezas" value={term} onChange={e => setTerm(e.target.value)} />
            </label>

            <label className={styles.sort}>
                <span className="visuallyHidden">Ordenar</span>
                <select value={sort} onChange={e => updateParams({sort: e.target.value === 'recommended' ? null : e.target.value})}>
                    {(Object.keys(SORT_LABELS) as CatalogSort[]).map(value => <option key={value} value={value}>{SORT_LABELS[value]}</option>)}
                </select>
            </label>
        </div>
    );
};

export default CatalogToolbar;
