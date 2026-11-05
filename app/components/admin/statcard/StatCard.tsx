import Link from 'next/link';
import styles from './statcard.module.css';

interface StatCardProps
{
    label:  string;
    value:  number;
    hint?:  string;
    href?:  string;
    alert?: boolean;
}

const StatCard = ({label, value, hint, href, alert = false}: StatCardProps) =>
{
    const content = (
        <>
            <span className={styles.value}>{value}</span>
            <span className={styles.label}>{label}</span>
            {hint && <span className={styles.hint}>{hint}</span>}
        </>
    );

    return href
        ? <Link href={href} className={styles.card} data-alert={alert}>{content}</Link>
        : <div className={styles.card} data-alert={alert}>{content}</div>;
};

export default StatCard;
