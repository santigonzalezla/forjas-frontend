import type {Metadata} from 'next';
import {Suspense} from 'react';
import ProductView from '@/app/components/product/productview/ProductView';
import {getProductBySlug, getProductSlugs} from '@/services/queries/catalog';

export async function generateStaticParams()
{
    const slugs = await getProductSlugs();
    return slugs.map(slug => ({slug}));
}

export async function generateMetadata({params}: PageProps<'/shop/[slug]'>): Promise<Metadata>
{
    const {slug}  = await params;
    const product = await getProductBySlug(slug);
    if (!product) return {title: 'Producto no encontrado'};

    return {
        title:       product.name,
        description: `${product.name}: ${product.detail}. Hecho a mano por Forjas en Valledupar.`,
        openGraph:   {images: [{url: product.image.src, width: product.image.width, height: product.image.height, alt: product.image.alt}]},
    };
}

export default function ProductPage({params}: PageProps<'/shop/[slug]'>)
{
    return (
        <>
            <Suspense fallback={<div className="container" style={{minHeight: '70svh'}} aria-busy="true" />}>
                <ProductView params={params} />
            </Suspense>
        </>
    );
}
