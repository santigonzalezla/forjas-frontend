import type {Metadata} from 'next';
import {Suspense} from 'react';
import styles from './design.module.css';
import Configurator from '@/app/components/design/configurator/Configurator';
import {parseDesign, pieceForSlug, presetForSlug} from '@/lib/configurator';
import {getProductBySlug} from '@/services/queries/catalog';

export const metadata: Metadata = {
    title:       'Diseña en 3D',
    description: 'Diseña en 3D tu portón, reja, baranda, mesas nido, butaco o poltrona: medidas, motivos, colores y acabado, con precio estimado al instante.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ConfiguratorLoader = async ({searchParams}: {searchParams: SearchParams}) =>
{
    const params  = await searchParams;
    const slug    = Array.isArray(params.piece) ? params.piece[0] : params.piece;
    const product = slug ? await getProductBySlug(slug) : null;
    const hinted  = product ? pieceForSlug(product.slug) : undefined;

    return (
        <Configurator
            initialDesign={parseDesign(params, hinted, product ? presetForSlug(product.slug) : undefined)}
            product={product ? {slug: product.slug, name: product.name} : undefined}
        />
    );
};

export default function DesignPage({searchParams}: PageProps<'/design'>)
{
    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Diseña tu pieza en 3D</h1>
                <p className={styles.lead}>Ornamentación a tu medida o muebles con los colores que quieras. El precio estimado se actualiza con cada cambio.</p>
            </header>
            <Suspense fallback={<div className={styles.fallback} aria-busy="true" />}>
                <ConfiguratorLoader searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
