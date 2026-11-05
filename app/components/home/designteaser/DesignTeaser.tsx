'use client';

import {useState} from 'react';
import styles from './designteaser.module.css';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import RosetteStage from '@/app/components/three/rosettestage/RosetteStage';
import {FINISHES, findFinish, type FinishId, type RosetteParts} from '@/lib/finishes';

const PART_OPTIONS: {key: keyof RosetteParts; label: string}[] = [
    {key: 'scrolls', label: 'Volutas'},
    {key: 'spears',  label: 'Lanzas'},
    {key: 'collars', label: 'Collarines'},
];

const DesignTeaser = () =>
{
    const [finish,   setFinish]   = useState<FinishId>('negro');
    const [parts,    setParts]    = useState<RosetteParts>({scrolls: true, spears: true, collars: true});
    const [forgeKey, setForgeKey] = useState(0);

    const togglePart = (key: keyof RosetteParts) => setParts(previous => ({...previous, [key]: !previous[key]}));

    return (
        <section className={`section tone-dark ${styles.section}`} aria-labelledby="disena-titulo">
            <div className={`container ${styles.grid}`}>
                <div className={styles.copy}>
                    <h2 id="disena-titulo" className={styles.title} data-reveal-words>
                        Lo diseñas tú.
                        <span className={styles.titleMuted}>Lo forjamos nosotros.</span>
                    </h2>
                    <p className={styles.text}>
                        Prueba con la roseta de nuestro logo: gírala, cambia el acabado y quita o pon ornamentos.
                        Así funciona el configurador para portones, rejas y barandas, con precio estimado antes de
                        pedir la visita técnica.
                    </p>

                    <div className={styles.controls}>
                        <fieldset className={styles.group}>
                            <legend className={styles.legend}>Acabado · <span>{findFinish(finish).label}</span></legend>
                            <div className={styles.swatches}>
                                {FINISHES.map(option => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={styles.swatch}
                                        style={{background: option.swatch}}
                                        data-active={option.id === finish}
                                        onClick={() => setFinish(option.id)}
                                        aria-label={option.label}
                                        aria-pressed={option.id === finish}
                                    />
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className={styles.group}>
                            <legend className={styles.legend}>Ornamentos</legend>
                            <div className={styles.chips}>
                                {PART_OPTIONS.map(option => (
                                    <button
                                        key={option.key}
                                        type="button"
                                        className={styles.chip}
                                        data-active={parts[option.key]}
                                        onClick={() => togglePart(option.key)}
                                        aria-pressed={parts[option.key]}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    </div>

                    <div className={styles.actions}>
                        <ButtonLink href="/design">Empezar mi diseño</ButtonLink>
                        <button type="button" className={styles.reforge} onClick={() => setForgeKey(key => key + 1)}>
                            Forjar de nuevo
                        </button>
                    </div>
                </div>

                <RosetteStage finish={finish} parts={parts} forgeKey={forgeKey} />
            </div>
        </section>
    );
};

export default DesignTeaser;
