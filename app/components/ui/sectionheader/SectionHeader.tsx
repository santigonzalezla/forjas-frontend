import Link from 'next/link';
import styles from './sectionheader.module.css';
import {ArrowRight} from '@/app/components/svg';

interface SectionHeaderProps
{
    title:        string;
    description?: string;
    action?:      {href: string; label: string};
    id?:          string;
}

const SectionHeader = ({title, description, action, id}: SectionHeaderProps) =>
{
    return (
        <div className={styles.header}>
            <div>
                <h2 id={id} className={styles.title} data-reveal-words>{title}</h2>
                {description && <p className={styles.description} data-reveal>{description}</p>}
            </div>
            {action && (
                <Link href={action.href} className={styles.action} data-reveal>
                    {action.label}
                    <ArrowRight />
                </Link>
            )}
        </div>
    );
};

export default SectionHeader;
