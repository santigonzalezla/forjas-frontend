'use client';

import Link from 'next/link';
import {Suspense} from 'react';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import styles from './edit.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import ProductForm from '@/app/components/admin/productform/ProductForm';
import ImageManager from '@/app/components/admin/imagemanager/ImageManager';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {External} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useAuth} from '@/context/AuthContext';
import {useErrorToast} from '@/hooks/useErrorToast';
import {ProductStatus, UserRole, type ApiCategory, type ApiProduct} from '@/app/interfaces/admin';

function EditProduct()
{
    const {id}   = useParams<{id: string}>();
    const {user} = useAuth();

    const {data: product, execute: reload, error: loadError} = useFetch<ApiProduct>(`product/admin/${id}`);
    const {data: categories}                                 = useFetch<ApiCategory[]>('category/admin');
    const {execute: update, isLoading: saving, error}        = useFetch<ApiProduct>(`product/${id}`, {method: 'PATCH', immediate: false});

    useErrorToast(error);

    const handleSubmit = async (payload: Record<string, unknown>) =>
    {
        const updated = await update({body: payload});
        if (!updated) return;
        toast.success('Cambios guardados');
        reload();
    };

    if (loadError) return <p className={styles.state}>No encontramos este producto. <Link href="/admin/products">Volver a productos</Link></p>;
    if (!product || !categories) return <p className={styles.state}>Cargando…</p>;

    return (
        <>
            <PageHeader
                title={product.name}
                description={product.deletedAt ? 'Este producto está en la papelera.' : `Producto #${product.numId}`}
                actions={product.status === ProductStatus.PUBLISHED && !product.deletedAt && (
                    <ButtonLink href={`/shop/${product.slug}`} variant="secondary" external icon={<External />}>Ver en la tienda</ButtonLink>
                )}
            />
            <div className={styles.stack}>
                <ImageManager basePath={`product/${product.id}`} itemName={product.name} images={product.images} onChange={reload} />
                {/* key: al recargar el producto, el formulario toma los valores guardados */}
                <ProductForm
                    key={product.updatedAt}
                    initial={product}
                    categories={categories}
                    canSetPrice={user?.role === UserRole.ADMIN}
                    saving={saving}
                    onSubmit={handleSubmit}
                />
            </div>
        </>
    );
}

export default function EditProductPage()
{
    return (
        <Suspense fallback={<p className={styles.state}>Cargando…</p>}>
            <EditProduct />
        </Suspense>
    );
}
