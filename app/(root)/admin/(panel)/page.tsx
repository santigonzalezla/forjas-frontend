'use client';

import Link from 'next/link';
import styles from './dashboard.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import StatCard from '@/app/components/admin/statcard/StatCard';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {Plus} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useAuth} from '@/context/AuthContext';
import type {DashboardSummary} from '@/app/interfaces/admin';

export default function AdminDashboardPage()
{
    const {user}                  = useAuth();
    const {data: summary, isLoading} = useFetch<DashboardSummary>('dashboard/summary');

    return (
        <>
            <PageHeader
                title={`Hola, ${user?.firstName ?? ''}`}
                description="Así está tu tienda hoy."
                actions={<ButtonLink href="/admin/products/new" icon={<Plus />}>Nuevo producto</ButtonLink>}
            />

            {isLoading || !summary
                ? <p className={styles.loading}>Cargando…</p>
                : (
                    <>
                        <section className={styles.grid} aria-label="Solicitudes y portafolio">
                            <StatCard label="Solicitudes nuevas" value={summary.newQuotes} hint="Contacto, cotizaciones y diseños 3D" alert={summary.newQuotes > 0} href="/admin/quotes?status=NEW" />
                            <StatCard label="Proyectos" value={summary.projects} hint="En la página de proyectos" href="/admin/projects" />
                        </section>

                        <section className={styles.grid} aria-label="Catálogo">
                            <StatCard label="Publicados" value={summary.products.published} hint="Visibles en la tienda" href="/admin/products?status=PUBLISHED" />
                            <StatCard label="Borradores" value={summary.products.draft} hint="Aún no se ven en la tienda" href="/admin/products?status=DRAFT" />
                            <StatCard label="Sin fotos" value={summary.products.withoutImages} hint="Agrega al menos una foto" alert={summary.products.withoutImages > 0} href="/admin/products" />
                            <StatCard label="En la papelera" value={summary.products.trash} href="/admin/products?trash=1" />
                        </section>

                        <section className={styles.grid} aria-label="Tienda">
                            <StatCard label="Categorías" value={summary.categories} href="/admin/categories" />
                            <StatCard label="Piezas en el hero" value={summary.featuredPieces} hint="La fila animada del inicio" href="/admin/pieces" />
                            <StatCard label="Personas en el equipo" value={summary.team} />
                        </section>

                        <p className={styles.tip}>
                            Los cambios que guardes aquí se ven en la tienda en segundos.{' '}
                            <Link href="/" target="_blank" className={styles.tipLink}>Abrir la tienda</Link>
                        </p>
                    </>
                )}
        </>
    );
}
