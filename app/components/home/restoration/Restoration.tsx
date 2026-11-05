'use client';

import Image from 'next/image';
import {useState} from 'react';
import styles from './restoration.module.css';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import Compare from '@/app/components/ui/compare/Compare';
import type {Restoration as RestorationCase} from '@/app/interfaces/interfaces';
import {buildWhatsAppLink} from '@/lib/whatsapp';

interface RestorationProps
{
    items: RestorationCase[];
}

const Restoration = ({items}: RestorationProps) =>
{
    const [activeId, setActiveId] = useState(items[0]?.id);
    const active = items.find(item => item.id === activeId) ?? items[0];

    if (!active) return null;

    return (
        <section className={`section ${styles.section}`} aria-labelledby="restauracion-titulo">
            <div className={`container ${styles.grid}`}>
                <div className={styles.copy}>
                    <h2 id="restauracion-titulo" className={styles.title} data-reveal-words>Restauramos muebles con historia</h2>
                    <p className={styles.description} data-reveal>
                        Desde 2016 devolvemos la vida a muebles antiguos. Arrastra el divisor para ver cómo llegaron
                        al taller y cómo salieron.
                    </p>

                    <div className={styles.case} key={active.id}>
                        <h3 className={styles.caseTitle}>{active.title}</h3>
                        <p className={styles.caseText}>{active.description}</p>
                    </div>

                    <div className={styles.thumbs} role="tablist" aria-label="Casos de restauración">
                        {items.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={item.id === active.id}
                                className={styles.thumb}
                                data-active={item.id === active.id}
                                onClick={() => setActiveId(item.id)}
                            >
                                <span className={styles.thumbImage}>
                                    <Image src={item.after.src} alt="" fill sizes="72px" />
                                </span>
                                <span className={styles.thumbLabel}>{item.title}</span>
                            </button>
                        ))}
                    </div>

                    <ButtonLink
                        href={buildWhatsAppLink('Hola, quiero cotizar la restauración de un mueble. Les envío fotos.')}
                        variant="inverse"
                        external
                    >
                        Enviar fotos de mi mueble
                    </ButtonLink>
                </div>

                <div className={styles.viewer}>
                    <Compare key={active.id} before={active.before} after={active.after} />
                </div>
            </div>
        </section>
    );
};

export default Restoration;
