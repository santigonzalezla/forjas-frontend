import Link from 'next/link';
import styles from './projectsview.module.css';
import ProjectCard from '@/app/components/projects/projectcard/ProjectCard';
import RevealScope from '@/app/components/ui/revealscope/RevealScope';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {getProjects, getProjectTypes} from '@/services/queries/content';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ProjectsView = async ({searchParams}: {searchParams: SearchParams}) =>
{
    const params = await searchParams;
    const raw    = Array.isArray(params.type) ? params.type[0] : params.type;

    const types    = await getProjectTypes();
    const type     = raw && types.includes(raw) ? raw : undefined;
    const projects = await getProjects(type);

    return (
        <RevealScope>
            <div className={`container ${styles.page}`}>
                <header className={styles.header}>
                    <h1 className={styles.title} data-reveal-words>Proyectos</h1>
                    <p className={styles.lead} data-reveal>Cada pieza tiene una casa y una historia. Estos son algunos trabajos que salieron del taller.</p>
                </header>

                <nav className={styles.filters} aria-label="Tipos de trabajo" data-reveal>
                    <Link href="/projects" className={styles.filter} data-active={!type} aria-current={!type ? 'page' : undefined}>Todos</Link>
                    {types.map(option => (
                        <Link
                            key={option}
                            href={`/projects?type=${encodeURIComponent(option)}`}
                            className={styles.filter}
                            data-active={option === type}
                            aria-current={option === type ? 'page' : undefined}
                        >
                            {option}
                        </Link>
                    ))}
                </nav>

                <div className={styles.grid}>
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} tall={index % 3 === 0} />
                    ))}
                </div>

                <aside className={`tone-brand ${styles.cta}`} data-reveal>
                    <p className={styles.ctaTitle}>¿Tienes un espacio esperando una pieza?</p>
                    <div className={styles.ctaActions}>
                        <ButtonLink href="/design">Diseñar en 3D</ButtonLink>
                        <ButtonLink href="/quote" variant="secondary">Pedir cotización</ButtonLink>
                    </div>
                </aside>
            </div>
        </RevealScope>
    );
};

export default ProjectsView;
