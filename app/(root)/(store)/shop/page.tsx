import type {Metadata} from 'next';
import {Suspense} from 'react';
import CatalogView from '@/app/components/shop/catalogview/CatalogView';
import CatalogSkeleton from '@/app/components/shop/catalogskeleton/CatalogSkeleton';

export const metadata: Metadata = {
    title:       'Tienda',
    description: 'Muebles, lámparas y decoración en hierro forjado hechos a mano en Valledupar. Envíos a todo Colombia.',
};

// Los filtros viven en la URL (?category=…&sort=…&q=…&page=…). Se leen dentro de
// Suspense para que el encabezado y el esqueleto salgan en el HTML estático.
export default function ShopPage({searchParams}: PageProps<'/shop'>)
{
    return (
        <>
            <Suspense fallback={<CatalogSkeleton />}>
                <CatalogView searchParams={searchParams} />
            </Suspense>
        </>
    );
}
