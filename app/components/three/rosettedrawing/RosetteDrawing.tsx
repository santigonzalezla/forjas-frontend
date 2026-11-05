'use client';

import {useEffect, useRef} from 'react';
import {animate, createScope, onScroll, stagger, svg} from 'animejs';
import styles from './rosettedrawing.module.css';
import {buildRosette, toSvgPath} from '@/lib/rosette';

const GEOMETRY = buildRosette();

// La roseta del logo dibujándose trazo a trazo (anime.js createDrawable).
// Es el póster mientras carga el 3D y la versión para movimiento reducido.
const RosetteDrawing = ({hidden = false}: {hidden?: boolean}) =>
{
    const rootRef = useRef<SVGSVGElement>(null);

    useEffect(() =>
    {
        if (!rootRef.current) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const scope = createScope({root: rootRef.current}).add(() =>
        {
            animate(svg.createDrawable('path'), {
                draw:     ['0 0', '0 1'],
                duration: 1400,
                delay:    stagger(40),
                ease:     'inOut(3)',
                autoplay: onScroll({target: rootRef.current as SVGSVGElement}),
            });
        });

        return () => scope.revert();
    }, []);

    return (
        <svg
            ref={rootRef}
            className={styles.drawing}
            data-hidden={hidden}
            viewBox="-1.12 -1.12 2.24 2.24"
            aria-hidden
        >
            {GEOMETRY.paths.map((path, i) => (
                <path key={i} d={toSvgPath(path)} data-kind={path.kind} />
            ))}
        </svg>
    );
};

export default RosetteDrawing;
