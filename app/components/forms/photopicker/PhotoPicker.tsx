'use client';

import {useEffect, useRef, useState, type DragEvent} from 'react';
import {toast} from 'sonner';
import styles from './photopicker.module.css';
import {Close, Upload} from '@/app/components/svg';

export interface PickedPhoto
{
    file: File;
    url:  string;
}

interface PhotoPickerProps
{
    photos:    PickedPhoto[];
    onChange:  (photos: PickedPhoto[]) => void;
    max?:      number;
    maxSizeMb?: number;
}

const PhotoPicker = ({photos, onChange, max = 5, maxSizeMb = 10}: PhotoPickerProps) =>
{
    const inputRef            = useRef<HTMLInputElement>(null);
    const [dragging, setDrag] = useState(false);

    const photosRef = useRef(photos);
    useEffect(() =>
    {
        photosRef.current = photos;
    });
    useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.url)), []);

    const add = (files: FileList | null) =>
    {
        if (!files) return;

        const accepted: PickedPhoto[] = [];
        for (const file of Array.from(files))
        {
            if (!file.type.startsWith('image/'))
            {
                toast.error(`${file.name} no es una imagen`);
                continue;
            }
            if (file.size > maxSizeMb * 1024 * 1024)
            {
                toast.error(`${file.name} pesa más de ${maxSizeMb} MB`);
                continue;
            }
            if (photos.length + accepted.length >= max)
            {
                toast.error(`Puedes adjuntar hasta ${max} fotos`);
                break;
            }
            accepted.push({file, url: URL.createObjectURL(file)});
        }

        if (accepted.length) onChange([...photos, ...accepted]);
    };

    const remove = (target: PickedPhoto) =>
    {
        URL.revokeObjectURL(target.url);
        onChange(photos.filter(photo => photo !== target));
    };

    const handleDrop = (event: DragEvent<HTMLButtonElement>) =>
    {
        event.preventDefault();
        setDrag(false);
        add(event.dataTransfer.files);
    };

    return (
        <div className={styles.picker}>
            {photos.length < max && (
                <button
                    type="button"
                    className={styles.drop}
                    data-dragging={dragging}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={event => { event.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                >
                    <Upload />
                    <span className={styles.dropTitle}>Agregar fotos</span>
                    <span className={styles.dropHint}>Arrastra aquí o toca para elegir. Hasta {max}, máximo {maxSizeMb} MB cada una.</span>
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={event => { add(event.target.files); event.target.value = ''; }}
            />
            {photos.length > 0 && (
                <ul className={styles.thumbs}>
                    {photos.map(photo => (
                        <li key={photo.url} className={styles.thumb}>
                            {/* Vista previa local (blob:), no pasa por next/image */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.url} alt={photo.file.name} />
                            <button type="button" className={styles.remove} onClick={() => remove(photo)} aria-label={`Quitar ${photo.file.name}`}>
                                <Close />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PhotoPicker;
