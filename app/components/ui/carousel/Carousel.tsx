'use client';

import {useRef, type ReactNode} from 'react';
import styles from './carousel.module.css';
import {ArrowLeft, ArrowRight} from '@/app/components/svg';

interface CarouselProps
{
    children: ReactNode;
    label:    string;
}

const Carousel = ({children, label}: CarouselProps) =>
{
    const trackRef = useRef<HTMLDivElement>(null);

    const scrollByPage = (direction: 1 | -1) =>
    {
        const track = trackRef.current;
        if (!track) return;
        track.scrollBy({left: direction * track.clientWidth * 0.9, behavior: 'smooth'});
    };

    return (
        <div className={styles.carousel}>
            <div className={styles.controls}>
                <button type="button" className={styles.arrow} onClick={() => scrollByPage(-1)} aria-label="Anterior">
                    <ArrowLeft />
                </button>
                <button type="button" className={styles.arrow} onClick={() => scrollByPage(1)} aria-label="Siguiente">
                    <ArrowRight />
                </button>
            </div>
            <div ref={trackRef} className={styles.track} role="region" aria-label={label} tabIndex={0}>
                {children}
            </div>
        </div>
    );
};

export default Carousel;
