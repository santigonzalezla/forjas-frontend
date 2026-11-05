import styles from './statusbadge.module.css';

export type Tone = 'success' | 'neutral' | 'warning' | 'muted' | 'danger';

interface StatusBadgeProps
{
    tone:  Tone;
    label: string;
}

// Estado en texto con un punto de color; sin bordes ni mayúsculas
const StatusBadge = ({tone, label}: StatusBadgeProps) =>
{
    return <span className={styles.badge} data-tone={tone}>{label}</span>;
};

export default StatusBadge;
