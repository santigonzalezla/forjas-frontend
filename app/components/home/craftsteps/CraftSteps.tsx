'use client';

import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import styles from './craftsteps.module.css';
import type {CraftStep} from '@/app/interfaces/interfaces';

interface CraftStepsProps
{
    steps: CraftStep[];
}

// Patrón StickyScrollReveal: el texto queda fijo a la izquierda y la etapa activa
// cambia según la foto que está en el centro de la pantalla.
const CraftSteps = ({steps}: CraftStepsProps) =>
{
    const [active, setActive] = useState(0);
    const imageRefs           = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() =>
    {
        const observer = new IntersectionObserver(entries =>
        {
            entries.forEach(entry =>
            {
                if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
            });
        }, {rootMargin: '-45% 0px -45% 0px'});

        imageRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, [steps.length]);

    return (
        <section className={`section ${styles.section}`} aria-labelledby="oficio-titulo">
            <div className={`container ${styles.grid}`}>
                <div className={styles.sticky}>
                    <h2 id="oficio-titulo" className={styles.title} data-reveal-words>Del fuego a tu casa</h2>
                    <p className={styles.intro}>
                        Siempre hemos creído que el hierro forjado es una labor artística. Así trabajamos cada pieza.
                    </p>
                    <ol className={styles.steps}>
                        {steps.map((step, i) => (
                            <li key={step.id} className={styles.step} data-active={i === active}>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepText}>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className={styles.images}>
                    {steps.map((step, i) => (
                        <div
                            key={step.id}
                            ref={el => { imageRefs.current[i] = el; }}
                            data-index={i}
                            className={styles.imageWrap}
                            data-active={i === active}
                        >
                            <div className={styles.parallax} data-parallax="28">
                                <Image src={step.image.src} alt={step.image.alt} fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.image} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CraftSteps;
