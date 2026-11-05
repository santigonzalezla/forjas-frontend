import Image from 'next/image';
import styles from './timeline.module.css';
import type {Milestone} from '@/lib/content/about';

const Timeline = ({milestones}: {milestones: Milestone[]}) =>
{
    return (
        <ol className={styles.list}>
            {milestones.map(milestone => (
                <li key={milestone.id} className={styles.item} data-reveal>
                    <div className={styles.marker}>
                        <span className={styles.year}>{milestone.year}</span>
                    </div>
                    <p className={styles.text}>{milestone.text}</p>
                    <div className={styles.media}>
                        <Image src={milestone.image.src} alt={milestone.image.alt} fill sizes="(max-width: 760px) 100vw, 34vw" className={styles.image} />
                    </div>
                </li>
            ))}
        </ol>
    );
};

export default Timeline;
