'use client';

import Image from 'next/image';
import {useEffect, useRef} from 'react';
import {animate} from 'animejs';
import styles from './compare.module.css';
import type {MediaImage} from '@/app/interfaces/interfaces';

interface CompareProps
{
    before: MediaImage;
    after:  MediaImage;
}

const clamp = (x: number) => Math.min(100, Math.max(0, x));

// Comparador antes/después (patrón Compare de Aceternity, en CSS Modules).
// La posición vive en una variable CSS: arrastrar no provoca renders de React.
const Compare = ({before, after}: CompareProps) =>
{
    const rootRef   = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const position  = useRef(50);

    const setPosition = (value: number) =>
    {
        position.current = clamp(value);
        rootRef.current?.style.setProperty('--pos', `${position.current}%`);
        handleRef.current?.setAttribute('aria-valuenow', String(Math.round(position.current)));
    };

    // Al entrar en pantalla, el divisor hace un pequeño barrido para invitar a arrastrarlo
    useEffect(() =>
    {
        const el = rootRef.current;
        if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const state    = {value: 50};
        const observer = new IntersectionObserver(([entry]) =>
        {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            animate(state, {
                value:    [50, 22, 78, 50],
                duration: 2200,
                delay:    400,
                ease:     'inOut(2)',
                onUpdate: () => setPosition(state.value),
            });
        }, {threshold: 0.6});

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const fromPointer = (clientX: number) =>
    {
        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPosition(((clientX - rect.left) / rect.width) * 100);
    };

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) =>
    {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) =>
    {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX);
    };

    const onKeyDown = (e: React.KeyboardEvent) =>
    {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); setPosition(position.current - 5); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setPosition(position.current + 5); }
    };

    return (
        <div
            ref={rootRef}
            className={styles.compare}
            style={{aspectRatio: `${after.width} / ${after.height}`}}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
        >
            <Image src={after.src} alt={after.alt} fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.image} draggable={false} />
            <div className={styles.before}>
                <Image src={before.src} alt={before.alt} fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.image} draggable={false} />
            </div>

            <span className={`${styles.label} ${styles.labelBefore}`}>Antes</span>
            <span className={`${styles.label} ${styles.labelAfter}`}>Después</span>

            <div
                ref={handleRef}
                className={styles.handle}
                role="slider"
                tabIndex={0}
                aria-label="Comparar antes y después"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={50}
                onKeyDown={onKeyDown}
            >
                <span className={styles.knob} aria-hidden>
                    <svg viewBox="0 0 24 24"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6" /></svg>
                </span>
            </div>
        </div>
    );
};

export default Compare;
