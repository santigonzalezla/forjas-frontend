import type {Metadata} from 'next';
import Image from 'next/image';
import styles from './about.module.css';
import Timeline from '@/app/components/about/timeline/Timeline';
import ClosingBand from '@/app/components/home/closingband/ClosingBand';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import RevealRoot from '@/app/components/ui/revealroot/RevealRoot';
import {MILESTONES, TEAM} from '@/lib/content/about';
import {getYearsOfCraft} from '@/services/queries/content';

export const metadata: Metadata = {
    title:       'Nosotros',
    description: 'Forjas es el taller de la familia Losada Castro en Valledupar. Hierro forjado a mano desde 1997.',
};

export default async function AboutPage()
{
    const years = await getYearsOfCraft();

    return (
        <>
            <section className={`container ${styles.hero}`}>
                <div className={styles.heroText}>
                    <h1 className={styles.title} data-reveal-words>Una familia que decidió vivir del fuego</h1>
                    <p className={styles.lead} data-reveal>
                        En 1997 la familia Losada Castro dejó el negocio agropecuario, vendió sus fincas y creó Forjas en Valledupar.
                        Desde entonces, {years} años haciendo del hierro un arte: diseños únicos, hechos a mano.
                    </p>
                </div>
                <div className={styles.heroMedia} data-reveal>
                    <Image src="/img/puerta-hierro.webp" alt="Puerta en hierro forjado y vidrio" fill priority sizes="(max-width: 860px) 100vw, 40vw" className={styles.cover} />
                </div>
            </section>

            <section className={`band tone-dark ${styles.quoteBand}`}>
                <blockquote className={`container ${styles.quote}`} data-reveal-words>
                    Siempre hemos creído que el hierro forjado es una labor artística.
                </blockquote>
            </section>

            <section className={`container ${styles.section}`} aria-labelledby="historia">
                <h2 id="historia" className={styles.sectionTitle} data-reveal>Nuestra historia</h2>
                <Timeline milestones={MILESTONES} />
            </section>

            <section className={`container ${styles.section}`} aria-labelledby="equipo">
                <h2 id="equipo" className={styles.sectionTitle} data-reveal>La familia detrás del taller</h2>
                <ul className={styles.team}>
                    {TEAM.map(member => (
                        <li key={member.name} className={styles.member} data-reveal>
                            <span className={styles.memberName}>{member.name}</span>
                            <span className={styles.memberRole}>{member.role}</span>
                        </li>
                    ))}
                </ul>
                <p className={styles.craft} data-reveal>
                    Trabajamos el hierro en caliente o en frío, con fragua, yunque, tenazas y martillo. Cada pieza pasa por las manos
                    de la familia: el diseño con la arquitecta, la forja en el taller y el acabado final a mano.
                </p>
            </section>

            <section className={`container ${styles.recycled}`} aria-labelledby="reciclada">
                <div className={styles.recycledMedia} data-reveal>
                    <Image src="/img/silla-tanque.webp" alt="Poltrona hecha con un tanque reciclado" fill sizes="(max-width: 860px) 100vw, 50vw" className={styles.cover} />
                </div>
                <div className={styles.recycledText}>
                    <h2 id="reciclada" className={styles.sectionTitle} data-reveal>Línea reciclada</h2>
                    <p data-reveal>
                        Los tanques que transportaron combustible vuelven al taller convertidos en sofás,
                        poltronas y mesas. El acero conserva sus marcas; nosotros le damos una segunda vida.
                    </p>
                    <div data-reveal><ButtonLink href="/shop?category=linea-reciclada" variant="secondary">Ver la línea</ButtonLink></div>
                </div>
            </section>

            <ClosingBand />
            <RevealRoot />
        </>
    );
}
