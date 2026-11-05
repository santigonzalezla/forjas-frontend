'use client';

import Image from 'next/image';
import {useState, type FormEvent} from 'react';
import {toast} from 'sonner';
import styles from './pieces.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import Modal from '@/app/components/ui/modal/Modal';
import Button from '@/app/components/ui/button/Button';
import Field, {Input, Select} from '@/app/components/ui/field/Field';
import Toggle from '@/app/components/ui/toggle/Toggle';
import StatusBadge from '@/app/components/ui/statusbadge/StatusBadge';
import ConfirmModal from '@/app/components/ui/confirmmodal/ConfirmModal';
import {ChevronDown, ChevronUp, Edit, Plus, Trash} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useConfirm} from '@/hooks/useConfirm';
import {useErrorToast} from '@/hooks/useErrorToast';
import type {ApiFeaturedPiece, ApiProduct, ApiProductImage} from '@/app/interfaces/admin';
import type {PaginatedResponse} from '@/app/interfaces/interfaces';

interface PieceForm
{
    name:               string;
    primaryProductId:   string;
    secondaryProductId: string;
    image:              ApiProductImage | null;
    isActive:           boolean;
}

const EMPTY: PieceForm = {name: '', primaryProductId: '', secondaryProductId: '', image: null, isActive: true};

export default function FeaturedPiecesPage()
{
    const [editing, setEditing] = useState<ApiFeaturedPiece | null>(null);
    const [open,    setOpen]    = useState(false);
    const [form,    setForm]    = useState<PieceForm>(EMPTY);

    const {data: pieces, isLoading, execute: refetch} = useFetch<ApiFeaturedPiece[]>('featured-piece/admin');
    const {data: products}                            = useFetch<PaginatedResponse<ApiProduct>>('product/admin?limit=100');
    const {execute: save, isLoading: saving, error}   = useFetch<unknown>('', {immediate: false});
    const {confirm, confirmState, handleConfirm, handleCancel} = useConfirm();

    useErrorToast(error);

    const productList = products?.data ?? [];
    const findProduct = (id: string) => productList.find(p => p.id === id);

    const imageOptions = [findProduct(form.primaryProductId), findProduct(form.secondaryProductId)]
        .flatMap(product => product?.images ?? []);

    const openCreate = () =>
    {
        setEditing(null);
        setForm(EMPTY);
        setOpen(true);
    };

    const openEdit = (piece: ApiFeaturedPiece) =>
    {
        setEditing(piece);
        const current = piece.products.flatMap(p => p.images).find(image => image.url === piece.image.url) ?? null;
        setForm({name: piece.name, primaryProductId: piece.products[0].id, secondaryProductId: piece.products[1].id, image: current, isActive: piece.isActive});
        setOpen(true);
    };

    const handleSubmit = async (e: FormEvent) =>
    {
        e.preventDefault();
        if (!form.image) return toast.error('Elige la foto de la pieza');

        const body = {
            name:               form.name.trim(),
            primaryProductId:   form.primaryProductId,
            secondaryProductId: form.secondaryProductId,
            imageUrl:           form.image.url,
            imageAlt:           form.image.alt,
            imageWidth:         form.image.width,
            imageHeight:        form.image.height,
            isActive:           form.isActive,
        };

        const ok = editing
            ? await save({method: 'PATCH', body}, `featured-piece/${editing.id}`)
            : await save({method: 'POST', body}, 'featured-piece');

        if (!ok) return;
        toast.success(editing ? 'Pieza actualizada' : 'Pieza agregada al inicio');
        setOpen(false);
        refetch();
    };

    const move = async (index: number, direction: -1 | 1) =>
    {
        if (!pieces) return;
        const ids = pieces.map(piece => piece.id);
        [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
        if (await save({method: 'PATCH', body: {pieceIds: ids}}, 'featured-piece/order')) refetch();
    };

    const handleDelete = async (piece: ApiFeaturedPiece) =>
    {
        if (!await confirm({title: 'Quitar del inicio', message: `"${piece.name}" dejará de aparecer en la fila del inicio. Los productos no se borran.`, confirmLabel: 'Quitar'})) return;
        if (!await save({method: 'DELETE'}, `featured-piece/${piece.id}`)) return;
        toast.success('Pieza quitada del inicio');
        refetch();
    };

    const valid = form.name.trim().length >= 2 && form.primaryProductId && form.secondaryProductId
        && form.primaryProductId !== form.secondaryProductId && form.image;

    return (
        <>
            <PageHeader
                title="Piezas del hero"
                description="Las obras que forman la fila animada del inicio, en este orden. Cada una muestra dos productos en la columna derecha."
                actions={<Button icon={<Plus />} onClick={openCreate}>Agregar pieza</Button>}
            />

            {isLoading && !pieces
                ? <p className={styles.empty}>Cargando…</p>
                : pieces?.length === 0
                    ? <p className={styles.empty}>Todavía no hay piezas en el inicio.</p>
                    : (
                        <ol className={styles.list}>
                            {pieces?.map((piece, index) => (
                                <li key={piece.id} className={styles.item}>
                                    <span className={styles.position}>{String(index + 1).padStart(2, '0')}</span>
                                    <span className={styles.thumb}>
                                        <Image src={piece.image.url} alt="" fill sizes="96px" className={styles.thumbImage} />
                                    </span>
                                    <div className={styles.info}>
                                        <p className={styles.name}>{piece.name}</p>
                                        <p className={styles.products}>{piece.products.map(p => p.name).join(' · ')}</p>
                                    </div>
                                    <StatusBadge tone={piece.isActive ? 'success' : 'muted'} label={piece.isActive ? 'Visible' : 'Oculta'} />
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.action} onClick={() => move(index, -1)} disabled={index === 0} aria-label="Subir"><ChevronUp /></button>
                                        <button type="button" className={styles.action} onClick={() => move(index, 1)} disabled={index === pieces.length - 1} aria-label="Bajar"><ChevronDown /></button>
                                        <button type="button" className={styles.action} onClick={() => openEdit(piece)} aria-label={`Editar ${piece.name}`}><Edit /></button>
                                        <button type="button" className={styles.action} data-danger onClick={() => handleDelete(piece)} aria-label={`Quitar ${piece.name}`}><Trash /></button>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}

            <Modal
                open={open}
                size="lg"
                title={editing ? 'Editar pieza' : 'Agregar pieza al inicio'}
                onClose={() => setOpen(false)}
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="piece-form" loading={saving} disabled={!valid}>Guardar</Button>
                    </>
                )}
            >
                <form id="piece-form" className={styles.form} onSubmit={handleSubmit}>
                    <Field label="Nombre de la obra" htmlFor="piece-name" hint="Aparece junto al número en el hero.">
                        <Input id="piece-name" required minLength={2} maxLength={80} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Portón colonial" />
                    </Field>
                    <div className={styles.row}>
                        <Field label="Producto principal" htmlFor="piece-primary">
                            <Select id="piece-primary" value={form.primaryProductId} onChange={e => setForm({...form, primaryProductId: e.target.value, image: null})}>
                                <option value="" disabled>Elige un producto</option>
                                {productList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                        </Field>
                        <Field label="Producto secundario" htmlFor="piece-secondary" error={form.primaryProductId && form.primaryProductId === form.secondaryProductId ? 'Elige un producto distinto al principal' : null}>
                            <Select id="piece-secondary" value={form.secondaryProductId} onChange={e => setForm({...form, secondaryProductId: e.target.value, image: null})}>
                                <option value="" disabled>Elige un producto</option>
                                {productList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                        </Field>
                    </div>

                    <fieldset className={styles.picker}>
                        <legend className={styles.pickerLabel}>Foto de la pieza</legend>
                        {imageOptions.length === 0
                            ? <p className={styles.pickerEmpty}>Elige los productos para ver sus fotos.</p>
                            : (
                                <div className={styles.pickerGrid}>
                                    {imageOptions.map(image => (
                                        <button
                                            key={image.id}
                                            type="button"
                                            className={styles.pickerItem}
                                            data-selected={form.image?.id === image.id}
                                            onClick={() => setForm({...form, image})}
                                            aria-pressed={form.image?.id === image.id}
                                            aria-label={image.alt}
                                        >
                                            <Image src={image.url} alt="" fill sizes="120px" className={styles.thumbImage} />
                                        </button>
                                    ))}
                                </div>
                            )}
                    </fieldset>

                    <Toggle id="piece-active" label="Visible en el inicio" checked={form.isActive} onChange={checked => setForm({...form, isActive: checked})} />
                </form>
            </Modal>

            {confirmState && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
        </>
    );
}
