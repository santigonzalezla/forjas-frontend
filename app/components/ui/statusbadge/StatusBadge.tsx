import styles from './statusbadge.module.css';

export type Tone = 'success' | 'neutral' | 'warning' | 'muted' | 'danger';

interface StatusBadgeProps
{
    tone:  Tone;
    label: string;
}

const StatusBadge = ({tone, label}: StatusBadgeProps) =>
{
    return <span className={styles.badge} data-tone={tone}>{label}</span>;
};

export default StatusBadge;
