import Image from 'next/image';
import Link from 'next/link';
import styles from './projectcard.module.css';
import type {Project} from '@/app/interfaces/interfaces';

const ProjectCard = ({project, tall = false}: {project: Project; tall?: boolean}) =>
{
    return (
        <Link href={`/projects/${project.slug}`} className={styles.card} data-reveal>
            <span className={styles.media} data-tall={tall}>
                <Image src={project.image.src} alt={project.image.alt} fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.image} />
            </span>
            <span className={styles.meta}>
                <span className={styles.title}>{project.title}</span>
                <span className={styles.type}>{project.type}</span>
            </span>
            <span className={styles.summary}>{project.summary}</span>
        </Link>
    );
};

export default ProjectCard;
