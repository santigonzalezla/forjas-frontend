'use client';

import Image from 'next/image';
import {useState, type MouseEvent} from 'react';
import styles from './productgallery.module.css';
import type {MediaImage} from '@/app/interfaces/interfaces';

interface ProductGalleryProps
{
    images: MediaImage[];
    name:   string;
}

const ProductGallery = ({images, name}: ProductGalleryProps) =>
{
    const [active, setActive] = useState(0);
    const [origin, setOrigin] = useState<string | null>(null);

    const current = images[active] ?? images[0];

    const handleMove = (e: MouseEvent<HTMLDivElement>) =>
    {
        const rect = e.currentTarget.getBoundingClientRect();
        const x    = ((e.clientX - rect.left) / rect.width) * 100;
        const y    = ((e.clientY - rect.top) / rect.height) * 100;
        setOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
    };

    return (
        <div className={styles.gallery}>
            <div
                className={styles.main}
                data-zoom={origin !== null}
                onMouseMove={handleMove}
                onMouseLeave={() => setOrigin(null)}
            >
                <Image
                    key={current.src}
                    src={current.src}
                    alt={current.alt}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 55vw"
                    className={styles.image}
                    style={origin ? {transformOrigin: origin} : undefined}
                />
            </div>

            {images.length > 1 && (
                <div className={styles.thumbs} role="tablist" aria-label={`Fotos de ${name}`}>
                    {images.map((image, index) => (
                        <button
                            key={image.src}
                            type="button"
                            role="tab"
                            aria-selected={index === active}
                            aria-label={`Ver foto ${index + 1}`}
                            className={styles.thumb}
                            data-active={index === active}
                            onClick={() => setActive(index)}
                        >
                            <Image src={image.src} alt="" fill sizes="96px" className={styles.thumbImage} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
