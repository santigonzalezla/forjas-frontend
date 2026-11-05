'use client';

import {Suspense, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {toast} from 'sonner';
import styles from './products.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import ProductTable from '@/app/components/admin/producttable/ProductTable';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import Field, {Input, Select} from '@/app/components/ui/field/Field';
import ConfirmModal from '@/app/components/ui/confirmmodal/ConfirmModal';
import {Plus} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useConfirm} from '@/hooks/useConfirm';
import {useDebounce} from '@/hooks/useDebounce';
import {useErrorToast} from '@/hooks/useErrorToast';
import {useAuth} from '@/context/AuthContext';
import {PRODUCT_STATUS_LABELS, ProductStatus, UserRole, type ApiCategory, type ApiProduct} from '@/app/interfaces/admin';
import type {PaginatedResponse} from '@/app/interfaces/interfaces';

function ProductsPage()
{
    const searchParams = useSearchParams();
    const {user}       = useAuth();
    const isAdmin      = user?.role === UserRole.ADMIN;

    const [search,   setSearch]   = useState('');
    const [status,   setStatus]   = useState(searchParams.get('status') ?? '');
    const [category, setCategory] = useState('');
    const [inTrash,  setInTrash]  = useState(searchParams.get('trash') === '1');

    const debouncedSearch = useDebounce(search);

    const query = new URLSearchParams({limit: '100'});
    if (debouncedSearch.trim()) query.set('search', debouncedSearch.trim());
    if (status)        query.set('status', status);
    if (category)      query.set('category', category);
    if (inTrash)       query.set('inTrash', 'true');

    const {data, isLoading, execute: refetch} = useFetch<PaginatedResponse<ApiProduct>>(`product/admin?${query.toString()}`);
    const {data: categories}                  = useFetch<ApiCategory[]>('category/admin');
    const {execute: mutate, error: mutateError} = useFetch<unknown>('', {immediate: false});
    const {confirm, confirmState, handleConfirm, handleCancel} = useConfirm();

    useErrorToast(mutateError);

    const handleTrash = async (product: ApiProduct) =>
    {
        if (!await confirm({title: 'Enviar a la papelera', message: `"${product.name}" dejará de verse en la tienda. Podrás restaurarlo después.`, confirmLabel: 'Enviar a la papelera'})) return;
        if (!await mutate({method: 'DELETE'}, `product/${product.id}`)) return;
        toast.success('Producto enviado a la papelera');
        refetch();
    };

    const handleRestore = async (product: ApiProduct) =>
    {
        if (!await mutate({method: 'PATCH'}, `product/${product.id}/restore`)) return;
        toast.success('Producto restaurado como borrador');
        refetch();
    };

    return (
        <>
            <PageHeader
                title="Productos"
                description="Todo lo que se vende o se cotiza en la tienda."
                actions={<ButtonLink href="/admin/products/new" icon={<Plus />}>Nuevo producto</ButtonLink>}
            />

            <div className={styles.filters}>
                <Field label="Buscar" htmlFor="search" className={styles.searchField}>
                    <Input id="search" type="search" placeholder="Nombre o detalle" value={search} onChange={e => setSearch(e.target.value)} />
                </Field>
                <Field label="Estado" htmlFor="status">
                    <Select id="status" value={status} onChange={e => setStatus(e.target.value)} disabled={inTrash}>
                        <option value="">Todos</option>
                        {Object.values(ProductStatus).map(value => <option key={value} value={value}>{PRODUCT_STATUS_LABELS[value]}</option>)}
                    </Select>
                </Field>
                <Field label="Categoría" htmlFor="category">
                    <Select id="category" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">Todas</option>
                        {categories?.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </Select>
                </Field>
                <div className={styles.tabs} role="tablist" aria-label="Vista">
                    <button type="button" role="tab" aria-selected={!inTrash} className={styles.tab} data-active={!inTrash} onClick={() => setInTrash(false)}>Activos</button>
                    <button type="button" role="tab" aria-selected={inTrash} className={styles.tab} data-active={inTrash} onClick={() => setInTrash(true)}>Papelera</button>
                </div>
            </div>

            <ProductTable
                products={data?.data ?? []}
                isLoading={isLoading}
                inTrash={inTrash}
                canDelete={isAdmin}
                onTrash={handleTrash}
                onRestore={handleRestore}
            />

            {confirmState && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
        </>
    );
}

// useSearchParams necesita Suspense (igual que en LegalDocs)
export default function ProductsPageWrapper()
{
    return (
        <Suspense fallback={null}>
            <ProductsPage />
        </Suspense>
    );
}
