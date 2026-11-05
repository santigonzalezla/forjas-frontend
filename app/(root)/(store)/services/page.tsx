import type {Metadata} from 'next';
import styles from './services.module.css';
import ServiceChapter from '@/app/components/services/servicechapter/ServiceChapter';
import CraftSteps from '@/app/components/home/craftsteps/CraftSteps';
import ClosingBand from '@/app/components/home/closingband/ClosingBand';
import RevealRoot from '@/app/components/ui/revealroot/RevealRoot';
import {SERVICES} from '@/lib/content/services';
import {getCraftSteps} from '@/services/queries/content';

export const metadata: Metadata = {
    title:       'Servicios',
    description: 'Ornamentación a medida, muebles en hierro forjado, restauración de muebles antiguos y estructuras en Valledupar.',
};

export default async function ServicesPage()
{
    const steps = await getCraftSteps();

    return (
        <>
            <header className={`container ${styles.hero}`}>
                <h1 className={styles.title} data-reveal-words>Lo que hacemos con el hierro</h1>
                <p className={styles.lead} data-reveal>
                    Más de dos décadas forjando piezas para casas y negocios del Cesar, La Guajira y todo el país.
                    Cada trabajo empieza con una conversación sobre tu espacio.
                </p>
                <nav className={styles.index} aria-label="Servicios" data-reveal>
                    {SERVICES.map(service => <a key={service.id} href={`#${service.id}`} className={styles.indexLink}>{service.title}</a>)}
                </nav>
            </header>

            <div className="container">
                {SERVICES.map((service, index) => <ServiceChapter key={service.id} service={service} flip={index % 2 === 1} />)}
            </div>

            <CraftSteps steps={steps} />
            <ClosingBand />
            <RevealRoot />
        </>
    );
}
