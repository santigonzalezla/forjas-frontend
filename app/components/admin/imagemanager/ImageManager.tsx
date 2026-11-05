'use client';

import Image from 'next/image';
import {useRef, useState, type DragEvent} from 'react';
import {toast} from 'sonner';
import styles from './imagemanager.module.css';
import ConfirmModal from '@/app/components/ui/confirmmodal/ConfirmModal';
import {Grip, Trash, Upload} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useConfirm} from '@/hooks/useConfirm';
import {useErrorToast} from '@/hooks/useErrorToast';
export interface ManagedImage
{
    id:    string;
    url:   string;
    alt:   string;
    role?: string;
}

export interface ImageRole
{
    value: string;
    label: string;
}

interface ImageManagerProps
{
    basePath:  string;
    itemName:  string;
    images:    ManagedImage[];
    onChange:  () => void;
    roles?:    ImageRole[];
    hint?:     string;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB   = 10;

const ImageManager = ({basePath, itemName, images, onChange, roles, hint = 'La primera es la portada. Arrastra para cambiar el orden.'}: ImageManagerProps) =>
{
    const [role, setRole] = useState(roles?.[0]?.value);
    const inputRef                      = useRef<HTMLInputElement>(null);
    const [order,    setOrder]          = useState(images);
    const [dragOver, setDragOver]       = useState(false);
    const [dragging, setDragging]       = useState<string | null>(null);
    const [uploading, setUploading]     = useState(0);

    const {execute: upload,  error: uploadError} = useFetch<ManagedImage>(`${basePath}/image`, {method: 'POST', isFormData: true, immediate: false});
    const {execute: mutate, error: mutateError}  = useFetch<unknown>('', {immediate: false});
    const {confirm, confirmState, handleConfirm, handleCancel} = useConfirm();

    const [prevImages, setPrevImages] = useState(images);
    if (images !== prevImages)
    {
        setPrevImages(images);
        setOrder(images);
    }

    useErrorToast(uploadError);
    useErrorToast(mutateError);

    const uploadFiles = async (files: FileList | File[]) =>
    {
        const valid = Array.from(files).filter(file =>
        {
            if (!ACCEPTED.includes(file.type)) { toast.error(`${file.name}: solo JPG, PNG o WebP`); return false; }
            if (file.size > MAX_MB * 1024 * 1024) { toast.error(`${file.name}: pesa más de ${MAX_MB} MB`); return false; }
            return true;
        });

        if (valid.length === 0) return;
        setUploading(valid.length);

        let uploaded = 0;
        for (const [index, file] of valid.entries())
        {
            const body = new FormData();
            body.append('alt', `${itemName} — foto ${order.length + index + 1}`);
            if (role) body.append('role', role);
            body.append('file', file);
            if (await upload({body})) uploaded++;
            setUploading(valid.length - index - 1);
        }

        if (uploaded > 0)
        {
            toast.success(uploaded === 1 ? 'Foto agregada' : `${uploaded} fotos agregadas`);
            onChange();
        }
    };

    const handleDrop = (e: DragEvent) =>
    {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    };

    const handleSortOver = (e: DragEvent, overId: string) =>
    {
        e.preventDefault();
        if (!dragging || dragging === overId) return;

        setOrder(previous =>
        {
            const from = previous.findIndex(image => image.id === dragging);
            const to   = previous.findIndex(image => image.id === overId);
            const next = [...previous];
            next.splice(to, 0, next.splice(from, 1)[0]);
            return next;
        });
    };

    const handleSortEnd = async () =>
    {
        setDragging(null);
        const changed = order.some((image, index) => image.id !== images[index]?.id);
        if (!changed) return;

        const ok = await mutate({method: 'PATCH', body: {imageIds: order.map(image => image.id)}}, `${basePath}/image/order`);
        if (!ok) { setOrder(images); return; }
        toast.success('Orden guardado');
        onChange();
    };

    const handleDelete = async (image: ManagedImage) =>
    {
        if (!await confirm({title: 'Eliminar foto', message: 'La foto dejará de verse en la página.', confirmLabel: 'Eliminar'})) return;
        if (!await mutate({method: 'DELETE'}, `${basePath}/image/${image.id}`)) return;
        toast.success('Foto eliminada');
        onChange();
    };

    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <h2 className={styles.title}>Fotos</h2>
                <p className={styles.hint}>{hint}</p>
            </div>

            {order.length > 0 && (
                <ul className={styles.grid}>
                    {order.map((image, index) => (
                        <li
                            key={image.id}
                            className={styles.item}
                            data-dragging={dragging === image.id}
                            draggable
                            onDragStart={() => setDragging(image.id)}
                            onDragOver={e => handleSortOver(e, image.id)}
                            onDragEnd={handleSortEnd}
                        >
                            <Image src={image.url} alt={image.alt} fill sizes="200px" className={styles.image} draggable={false} />
                            {roles
                                ? <span className={styles.cover}>{roles.find(r => r.value === image.role)?.label ?? image.role}</span>
                                : index === 0 && <span className={styles.cover}>Portada</span>}
                            <span className={styles.grip} aria-hidden><Grip /></span>
                            <button type="button" className={styles.delete} onClick={() => handleDelete(image)} aria-label="Eliminar foto">
                                <Trash />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {roles && (
                <div className={styles.roles} role="radiogroup" aria-label="Subir fotos como">
                    <span>Subir como</span>
                    {roles.map(option => (
                        <button key={option.value} type="button" role="radio" aria-checked={role === option.value} className={styles.role} data-active={role === option.value} onClick={() => setRole(option.value)}>
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            <button
                type="button"
                className={styles.dropzone}
                data-over={dragOver}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                disabled={uploading > 0}
            >
                <Upload />
                <span className={styles.dropTitle}>{uploading > 0 ? `Subiendo… (${uploading} pendiente${uploading > 1 ? 's' : ''})` : 'Arrastra fotos aquí o haz clic para elegirlas'}</span>
                <span className={styles.dropHint}>JPG, PNG o WebP de hasta {MAX_MB} MB. Se optimizan automáticamente.</span>
            </button>
            <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} multiple hidden onChange={e => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ''; }} />

            {confirmState && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
        </section>
    );
};

export default ImageManager;
