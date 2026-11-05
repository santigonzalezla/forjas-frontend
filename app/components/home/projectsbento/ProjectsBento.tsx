'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {animate} from 'animejs';
import styles from './projectsbento.module.css';
import type {MediaImage, Project} from '@/app/interfaces/interfaces';
import {ArrowRight, WhatsApp} from '@/app/components/svg';
import {CONTACT_EMAIL, WHATSAPP_DISPLAY} from '@/lib/constants';
import {buildWhatsAppLink} from '@/lib/whatsapp';

interface ProjectsBentoProps
{
    projects:     Project[];
    years:        number;
    craftImage:   MediaImage;
    servicesImage: MediaImage;
}

const SERVICES = ['Portones', 'Rejas', 'Barandas', 'Puertas', 'Estructuras', 'Muebles', 'Lámparas', 'Restauración'];

const ProjectsBento = ({projects, years, craftImage, servicesImage}: ProjectsBentoProps) =>
{
    const [active, setActive] = useState(0);
    const yearsRef            = useRef<HTMLSpanElement>(null);

    useEffect(() =>
    {
        const el = yearsRef.current;
        if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const counter  = {value: 0};
        el.textContent = '0';

        const observer = new IntersectionObserver(([entry]) =>
        {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            animate(counter, {
                value:    [0, years],
                duration: 1600,
                ease:     'out(4)',
                onUpdate: () => { el.textContent = String(Math.round(counter.value)); },
            });
        }, {threshold: 0.6});

        observer.observe(el);
        return () => observer.disconnect();
    }, [years]);

    const current = projects[active];

    return (
        <section className={`section ${styles.section}`} aria-labelledby="proyectos-titulo">
            <div className="container">
                <header className={styles.header}>
                    <div>
                        <h2 id="proyectos-titulo" className={styles.title} data-reveal-words>
                            Hierro que ya vive en casas y negocios del Cesar y La Guajira.
                        </h2>
                        <p className={styles.lead} data-reveal>
                            Portones, barandas, fachadas y muebles que salieron de nuestro taller en Valledupar.
                        </p>
                    </div>
                    <Link href="/projects" className={styles.allLink} data-reveal>
                        Ver todos los proyectos
                        <ArrowRight />
                    </Link>
                </header>

                <div className={styles.bento}>
                    {/* Selector de obras: la lista cambia la foto de fondo */}
                    <article className={`${styles.card} ${styles.showcase}`} data-reveal>
                        {projects.map((project, i) => (
                            <Image
                                key={project.id}
                                src={project.image.src}
                                alt={i === active ? project.image.alt : ''}
                                fill
                                sizes="(max-width: 900px) 100vw, 34vw"
                                className={styles.showcaseImage}
                                data-active={i === active}
                            />
                        ))}
                        <div className={styles.showcaseShade} />
                        <p className={styles.cardLabel}>Proyectos recientes</p>
                        <ol className={styles.projectList}>
                            {projects.map((project, i) => (
                                <li key={project.id}>
                                    <button
                                        type="button"
                                        className={styles.projectItem}
                                        data-active={i === active}
                                        onMouseEnter={() => setActive(i)}
                                        onFocus={() => setActive(i)}
                                        onClick={() => setActive(i)}
                                        aria-pressed={i === active}
                                    >
                                        <span className={styles.projectName}>{project.title}</span>
                                        <span className={styles.projectType}>{project.type}</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                        <span className="visuallyHidden" aria-live="polite">{current?.title}</span>
                    </article>

                    {/* La voz del taller (frase real del sitio de Forjas) */}
                    <article className={`${styles.card} ${styles.quote}`} data-reveal>
                        <p className={styles.cardLabelDark}>La voz del taller</p>
                        <blockquote className={styles.quoteText}>
                            “Siempre hemos creído que el hierro forjado es una labor artística.”
                        </blockquote>
                        <p className={styles.quoteAuthor}>
                            Familia Losada Castro
                            <span>Forjas, Valledupar</span>
                        </p>
                    </article>

                    {/* Años de oficio */}
                    <article className={`${styles.card} ${styles.years}`} data-reveal>
                        <Image src={craftImage.src} alt="" fill sizes="(max-width: 900px) 100vw, 30vw" className={styles.coverImage} />
                        <div className={styles.yearsShade} />
                        <p className={styles.yearsNumber}><span ref={yearsRef}>{years}</span></p>
                        <p className={styles.yearsCaption}>años forjando en Valledupar</p>
                    </article>

                    {/* Servicios en movimiento */}
                    <article className={`${styles.card} ${styles.services}`} data-reveal>
                        <Image src={servicesImage.src} alt="" fill sizes="(max-width: 900px) 100vw, 30vw" className={styles.coverImage} />
                        <div className={styles.servicesShade} />
                        <p className={styles.cardLabel}>Lo que hacemos</p>
                        <div className={styles.chipRows} aria-label={SERVICES.join(', ')}>
                            {[SERVICES, [...SERVICES].reverse()].map((row, r) => (
                                <div key={r} className={styles.chipRow} data-reverse={r === 1} aria-hidden>
                                    <div className={styles.chipTrack}>
                                        {[...row, ...row].map((service, i) => (
                                            <span key={`${service}-${i}`} className={styles.chip}>{service}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    {/* Contacto directo */}
                    <a
                        href={buildWhatsAppLink('Hola, vi sus proyectos y quiero cotizar uno parecido.')}
                        className={`${styles.card} ${styles.contact}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-reveal
                    >
                        <div>
                            <p className={styles.cardLabelDark}>Cuéntanos tu proyecto</p>
                            <p className={styles.contactMain}>WhatsApp {WHATSAPP_DISPLAY}</p>
                            <p className={styles.contactSub}>{CONTACT_EMAIL}</p>
                        </div>
                        <span className={styles.contactArrow} aria-hidden><WhatsApp /></span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ProjectsBento;
