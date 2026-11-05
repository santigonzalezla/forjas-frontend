'use client';

import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import ProductForm from '@/app/components/admin/productform/ProductForm';
import {useFetch} from '@/hooks/useFetch';
import {useAuth} from '@/context/AuthContext';
import {useErrorToast} from '@/hooks/useErrorToast';
import {UserRole, type ApiCategory, type ApiProduct} from '@/app/interfaces/admin';

export default function NewProductPage()
{
    const router = useRouter();
    const {user} = useAuth();

    const {data: categories}                       = useFetch<ApiCategory[]>('category/admin');
    const {execute: create, isLoading: saving, error} = useFetch<ApiProduct>('product', {method: 'POST', immediate: false});

    useErrorToast(error);

    const handleSubmit = async (payload: Record<string, unknown>) =>
    {
        const product = await create({body: payload});
        if (!product) return;

        toast.success('Producto creado. Ahora agrega sus fotos.');
        router.replace(`/admin/products/${product.id}`);
    };

    return (
        <>
            <PageHeader title="Nuevo producto" description="Después de crearlo podrás agregar las fotos." />
            {categories && (
                <ProductForm categories={categories} canSetPrice={user?.role === UserRole.ADMIN} saving={saving} onSubmit={handleSubmit} />
            )}
        </>
    );
}
