'use client';

import dynamic from 'next/dynamic';
import {useState} from 'react';
import styles from './piecestage.module.css';
import RosetteDrawing from '@/app/components/three/rosettedrawing/RosetteDrawing';
import {findPiece, type Design} from '@/lib/configurator';

// three.js se descarga solo en esta página y solo en el cliente
const PieceScene = dynamic(() => import('@/app/components/three/piecescene/PieceScene'), {ssr: false});

// Etiqueta de medidas: ancho × alto en ornamentación; tamaño elegido en muebles
const sizeLabel = (design: Design) =>
{
    const piece = findPiece(design.type);
    const size  = piece.sizes?.find(s => s.id === design.size);
    if (!size) return `${design.widthCm} × ${design.heightCm} cm`;
    return piece.namedSizes ? `${size.label} · ${size.hint}` : `${piece.label} ${size.label.toLowerCase()} · ${size.hint}`;
};

// Lienzo del configurador: el dibujo de la roseta hace de póster mientras carga el 3D
const PieceStage = ({design}: {design: Design}) =>
{
    const [ready, setReady] = useState(false);

    return (
        <div className={styles.stage}>
            <RosetteDrawing hidden={ready} />
            <div className={styles.canvas} data-ready={ready}>
                <PieceScene design={design} onReady={() => setReady(true)} />
            </div>
            <p className={styles.size} aria-live="polite">{sizeLabel(design)}</p>
            <p className={styles.hint} data-ready={ready}>Arrastra para girar la pieza</p>
        </div>
    );
};

export default PieceStage;
