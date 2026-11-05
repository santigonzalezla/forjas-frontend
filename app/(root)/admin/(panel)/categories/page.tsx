'use client';

import {useState, type FormEvent} from 'react';
import {toast} from 'sonner';
import styles from '@/app/components/admin/admintable/admintable.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import Modal from '@/app/components/ui/modal/Modal';
import Button from '@/app/components/ui/button/Button';
import Field, {Input, Textarea} from '@/app/components/ui/field/Field';
import Toggle from '@/app/components/ui/toggle/Toggle';
import StatusBadge from '@/app/components/ui/statusbadge/StatusBadge';
import ConfirmModal from '@/app/components/ui/confirmmodal/ConfirmModal';
import {Edit, Plus, Trash} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useConfirm} from '@/hooks/useConfirm';
import {useErrorToast} from '@/hooks/useErrorToast';
import {useAuth} from '@/context/AuthContext';
import {UserRole, type ApiCategory} from '@/app/interfaces/admin';

interface CategoryForm
{
    name:        string;
    description: string;
    sortOrder:   string;
    isActive:    boolean;
}

const EMPTY: CategoryForm = {name: '', description: '', sortOrder: '0', isActive: true};

export default function CategoriesPage()
{
    const {user}  = useAuth();
    const isAdmin = user?.role === UserRole.ADMIN;

    const [editing, setEditing] = useState<ApiCategory | null>(null);
    const [open,    setOpen]    = useState(false);
    const [form,    setForm]    = useState<CategoryForm>(EMPTY);

    const {data: categories, isLoading, execute: refetch} = useFetch<ApiCategory[]>('category/admin');
    const {execute: save, isLoading: saving, error: saveError} = useFetch<ApiCategory>('', {immediate: false});
    const {confirm, confirmState, handleConfirm, handleCancel} = useConfirm();

    useErrorToast(saveError);

    const openCreate = () =>
    {
        setEditing(null);
        setForm({...EMPTY, sortOrder: String(categories?.length ?? 0)});
        setOpen(true);
    };

    const openEdit = (category: ApiCategory) =>
    {
        setEditing(category);
        setForm({name: category.name, description: category.description ?? '', sortOrder: String(category.sortOrder), isActive: category.isActive});
        setOpen(true);
    };

    const handleSubmit = async (e: FormEvent) =>
    {
        e.preventDefault();
        const body = {name: form.name.trim(), description: form.description.trim() || undefined, sortOrder: Number(form.sortOrder) || 0, isActive: form.isActive};
        const ok   = editing
            ? await save({method: 'PATCH', body}, `category/${editing.id}`)
            : await save({method: 'POST', body}, 'category');

        if (!ok) return;
        toast.success(editing ? 'Categoría actualizada' : 'Categoría creada');
        setOpen(false);
        refetch();
    };

    const handleDelete = async (category: ApiCategory) =>
    {
        if (!await confirm({title: 'Eliminar categoría', message: `¿Eliminar "${category.name}"? Solo es posible si no tiene productos.`})) return;
        if (!await save({method: 'DELETE'}, `category/${category.id}`)) return;
        toast.success('Categoría eliminada');
        refetch();
    };

    return (
        <>
            <PageHeader
                title="Categorías"
                description="Organizan la tienda y los filtros del catálogo."
                actions={<Button icon={<Plus />} onClick={openCreate}>Nueva categoría</Button>}
            />

            {isLoading && !categories
                ? <p className={styles.empty}>Cargando…</p>
                : (
                    <div className={styles.wrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr><th>Nombre</th><th>Productos</th><th>Orden</th><th>Estado</th><th aria-label="Acciones" /></tr>
                            </thead>
                            <tbody>
                                {categories?.map(category => (
                                    <tr key={category.id}>
                                        <td>
                                            <span className={styles.strong}>{category.name}</span>
                                            {category.description && <span className={`${styles.muted}`}> · {category.description}</span>}
                                        </td>
                                        <td>{category._count?.products ?? 0}</td>
                                        <td className={styles.muted}>{category.sortOrder}</td>
                                        <td><StatusBadge tone={category.isActive ? 'success' : 'muted'} label={category.isActive ? 'Visible' : 'Oculta'} /></td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button type="button" className={styles.action} onClick={() => openEdit(category)} aria-label={`Editar ${category.name}`}><Edit /></button>
                                                {isAdmin && <button type="button" className={styles.action} data-danger onClick={() => handleDelete(category)} aria-label={`Eliminar ${category.name}`}><Trash /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            <Modal
                open={open}
                title={editing ? 'Editar categoría' : 'Nueva categoría'}
                onClose={() => setOpen(false)}
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="category-form" loading={saving} disabled={form.name.trim().length < 2}>Guardar</Button>
                    </>
                )}
            >
                <form id="category-form" className={styles.form} onSubmit={handleSubmit}>
                    <Field label="Nombre" htmlFor="cat-name">
                        <Input id="cat-name" required minLength={2} maxLength={60} value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus />
                    </Field>
                    <Field label="Descripción" htmlFor="cat-description" hint="Opcional.">
                        <Textarea id="cat-description" maxLength={300} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    </Field>
                    <Field label="Orden" htmlFor="cat-order" hint="Las de menor número aparecen primero.">
                        <Input id="cat-order" inputMode="numeric" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: e.target.value.replace(/\D/g, '')})} />
                    </Field>
                    <Toggle id="cat-active" label="Visible en la tienda" checked={form.isActive} onChange={checked => setForm({...form, isActive: checked})} />
                </form>
            </Modal>

            {confirmState && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
        </>
    );
}
