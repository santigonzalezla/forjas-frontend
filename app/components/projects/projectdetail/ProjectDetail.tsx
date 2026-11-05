import Image from 'next/image';
import {notFound} from 'next/navigation';
import styles from './projectdetail.module.css';
import Compare from '@/app/components/ui/compare/Compare';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import RevealScope from '@/app/components/ui/revealscope/RevealScope';
import PageNav from '@/app/components/ui/pagenav/PageNav';
import {WhatsApp} from '@/app/components/svg';
import {buildWhatsAppLink} from '@/lib/whatsapp';
import {getProjectBySlug, getProjects} from '@/services/queries/content';

const ProjectDetail = async ({params}: {params: Promise<{slug: string}>}) =>
{
    const {slug}  = await params;
    const project = await getProjectBySlug(slug);
    if (!project) notFound();

    // Vecinos en el mismo orden de la página de proyectos
    const all   = await getProjects();
    const index = all.findIndex(p => p.slug === project.slug);
    const prev  = index > 0 ? all[index - 1] : null;
    const next  = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
    const typeHref = `/projects?type=${encodeURIComponent(project.type)}`;

    const isRestoration = project.before && project.after;
    const facts = [
        {label: 'Tipo', value: project.type},
        {label: 'Lugar', value: project.location},
        {label: 'Año', value: project.year?.toString()},
    ].filter((fact): fact is {label: string; value: string} => !!fact.value);

    return (
        <RevealScope>
            <article className={`container ${styles.page}`}>
                <PageNav
                    back={{href: '/projects', label: 'Proyectos'}}
                    crumbs={[{href: '/projects', label: 'Proyectos'}, {href: typeHref, label: project.type}, {label: project.title}]}
                    prev={prev && {href: `/projects/${prev.slug}`, label: prev.title}}
                    next={next && {href: `/projects/${next.slug}`, label: next.title}}
                />

                <div className={styles.intro} data-split={!!isRestoration}>
                <header className={styles.header}>
                    <h1 className={styles.title} data-reveal-words>{project.title}</h1>
                    <p className={styles.summary} data-reveal>{project.summary}</p>
                    {facts.length > 0 && (
                        <dl className={styles.facts} data-reveal>
                            {facts.map(fact => (
                                <div key={fact.label} className={styles.fact}>
                                    <dt>{fact.label}</dt>
                                    <dd>{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </header>

                {isRestoration && (
                    <section className={styles.compare} aria-label="Antes y después" data-reveal>
                        <Compare before={project.before!} after={project.after!} />
                        <p className={styles.compareHint}>Arrastra el divisor para ver cómo llegó al taller y cómo salió.</p>
                    </section>
                )}
                </div>

                {project.gallery.length > 0 && (
                    <section className={styles.gallery} aria-label="Fotos del proyecto">
                        {project.gallery.map((image, index) => (
                            <div key={image.src} className={styles.photo} data-wide={index === 0 || (index === project.gallery.length - 1 && project.gallery.length % 2 === 0)} data-reveal>
                                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 60vw" className={styles.photoImage} priority={index === 0} />
                            </div>
                        ))}
                    </section>
                )}

                {project.description && <p className={styles.description} data-reveal>{project.description}</p>}

                <aside className={`tone-dark ${styles.cta}`} data-reveal>
                    <div>
                        <p className={styles.ctaTitle}>¿Quieres algo así?</p>
                        <p className={styles.ctaText}>{isRestoration ? 'Envíanos fotos de tu mueble y te cotizamos la restauración.' : 'Lo diseñamos a la medida de tu espacio.'}</p>
                    </div>
                    <div className={styles.ctaActions}>
                        <ButtonLink href={isRestoration ? '/quote?type=restoration' : '/design'}>{isRestoration ? 'Cotizar restauración' : 'Diseñar en 3D'}</ButtonLink>
                        <ButtonLink href={buildWhatsAppLink(`Hola, vi el proyecto "${project.title}" y quiero algo parecido.`)} variant="secondary" external icon={<WhatsApp />}>WhatsApp</ButtonLink>
                    </div>
                </aside>
            </article>
        </RevealScope>
    );
};

export default ProjectDetail;
