import Link from 'next/link';
import styles from './pagenav.module.css';
import {ArrowLeft, ArrowRight} from '@/app/components/svg';

export interface NavTarget
{
    href:  string;
    label: string;
}

interface PageNavProps
{
    back:   NavTarget;
    crumbs: {href?: string; label: string}[];
    prev?:  NavTarget | null;
    next?:  NavTarget | null;
}

const PageNav = ({back, crumbs, prev, next}: PageNavProps) =>
{
    const hasSiblings = prev !== undefined || next !== undefined;

    return (
        <div className={styles.bar}>
            <div className={styles.start}>
                <Link href={back.href} className={styles.round} aria-label={`Volver a ${back.label}`} title={`Volver a ${back.label}`}>
                    <ArrowLeft />
                </Link>
                <nav aria-label="Ruta" className={styles.crumbs}>
                    <ol>
                        {crumbs.map((crumb, index) =>
                        {
                            const last = index === crumbs.length - 1;
                            return (
                                <li key={`${crumb.label}-${index}`}>
                                    {crumb.href && !last
                                        ? <Link href={crumb.href}>{crumb.label}</Link>
                                        : <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>

            {hasSiblings && (
                <div className={styles.siblings}>
                    {prev
                        ? <Link href={prev.href} className={styles.round} aria-label={`Anterior: ${prev.label}`} title={prev.label}><ArrowLeft /></Link>
                        : <span className={styles.round} data-disabled aria-hidden><ArrowLeft /></span>}
                    {next
                        ? <Link href={next.href} className={styles.round} aria-label={`Siguiente: ${next.label}`} title={next.label}><ArrowRight /></Link>
                        : <span className={styles.round} data-disabled aria-hidden><ArrowRight /></span>}
                </div>
            )}
        </div>
    );
};

export default PageNav;
