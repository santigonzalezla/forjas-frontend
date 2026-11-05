'use client';

import dynamic from 'next/dynamic';
import {useEffect, useRef, useState} from 'react';
import styles from './rosettestage.module.css';
import RosetteDrawing from '@/app/components/three/rosettedrawing/RosetteDrawing';
import type {FinishId, RosetteParts} from '@/lib/finishes';

// three.js solo se descarga cuando la sección se acerca a la pantalla
const RosetteScene = dynamic(() => import('@/app/components/three/rosettescene/RosetteScene'), {ssr: false});

interface RosetteStageProps
{
    finish:   FinishId;
    parts:    RosetteParts;
    forgeKey: number;
}

const RosetteStage = ({finish, parts, forgeKey}: RosetteStageProps) =>
{
    const rootRef = useRef<HTMLDivElement>(null);
    const [mount,   setMount]   = useState(false);
    const [ready,   setReady]   = useState(false);
    const [entered, setEntered] = useState(0);

    useEffect(() =>
    {
        const el = rootRef.current;
        if (!el) return;

        // Monta el 3D un poco antes de que la sección entre en pantalla
        const preload = new IntersectionObserver(([entry]) =>
        {
            if (!entry.isIntersecting) return;
            setMount(true);
            preload.disconnect();
        }, {rootMargin: '400px'});

        // La pieza se forja frente al usuario: cuando está a la vista, no antes
        const reveal = new IntersectionObserver(([entry]) =>
        {
            if (!entry.isIntersecting) return;
            setEntered(1);
            reveal.disconnect();
        }, {threshold: 0.45});

        preload.observe(el);
        reveal.observe(el);
        return () =>
        {
            preload.disconnect();
            reveal.disconnect();
        };
    }, []);

    return (
        <div ref={rootRef} className={styles.stage}>
            <RosetteDrawing hidden={ready && entered > 0} />
            {mount && entered > 0 && (
                <div className={styles.canvas} data-ready={ready}>
                    <RosetteScene finish={finish} parts={parts} forgeKey={forgeKey} onReady={() => setReady(true)} />
                </div>
            )}
            <p className={styles.hint} data-ready={ready}>Arrastra para girar la pieza</p>
        </div>
    );
};

export default RosetteStage;
