'use client';

import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import styles from './pagination.module.css';
import {ArrowLeft, ArrowRight} from '@/app/components/svg';

// Conserva los filtros actuales y solo cambia ?page=
const Pagination = ({page, pages}: {page: number; pages: number}) =>
{
    const searchParams = useSearchParams();
    if (pages <= 1) return null;

    const hrefFor = (target: number) =>
    {
        const next = new URLSearchParams(searchParams.toString());
        if (target === 1) next.delete('page');
        else next.set('page', String(target));
        const query = next.toString();
        return `/shop${query ? `?${query}` : ''}`;
    };

    return (
        <nav className={styles.pagination} aria-label="Paginación">
            {page > 1
                ? <Link href={hrefFor(page - 1)} className={styles.arrow} aria-label="Página anterior"><ArrowLeft /></Link>
                : <span className={styles.arrow} data-disabled><ArrowLeft /></span>}
            {Array.from({length: pages}, (_, i) => i + 1).map(n => (
                <Link key={n} href={hrefFor(n)} className={styles.page} data-active={n === page} aria-current={n === page ? 'page' : undefined}>{n}</Link>
            ))}
            {page < pages
                ? <Link href={hrefFor(page + 1)} className={styles.arrow} aria-label="Página siguiente"><ArrowRight /></Link>
                : <span className={styles.arrow} data-disabled><ArrowRight /></span>}
        </nav>
    );
};

export default Pagination;
