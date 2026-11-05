import Image from 'next/image';
import styles from './servicechapter.module.css';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import type {Service} from '@/lib/content/services';

interface ServiceChapterProps
{
    service: Service;
    flip:    boolean; // alterna el lado de la foto
}

const ServiceChapter = ({service, flip}: ServiceChapterProps) =>
{
    return (
        <section id={service.id} className={styles.chapter} data-flip={flip} aria-labelledby={`${service.id}-titulo`}>
            <div className={styles.media} data-reveal>
                <div className={styles.parallax} data-parallax="24">
                    <Image src={service.image.src} alt={service.image.alt} fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.image} />
                </div>
            </div>
            <div className={styles.copy}>
                <h2 id={`${service.id}-titulo`} className={styles.title} data-reveal-words>{service.title}</h2>
                <p className={styles.intro} data-reveal>{service.intro}</p>
                <ul className={styles.items} data-reveal>
                    {service.items.map(item => <li key={item}>{item}</li>)}
                </ul>
                <div data-reveal>
                    <ButtonLink href={service.cta.href} variant="secondary">{service.cta.label}</ButtonLink>
                </div>
            </div>
        </section>
    );
};

export default ServiceChapter;
