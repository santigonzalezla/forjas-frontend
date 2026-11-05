import styles from './toggle.module.css';

interface ToggleProps
{
    id:        string;
    label:     string;
    checked:   boolean;
    onChange:  (checked: boolean) => void;
    hint?:     string;
    disabled?: boolean;
}

const Toggle = ({id, label, checked, onChange, hint, disabled = false}: ToggleProps) =>
{
    return (
        <label className={styles.toggle} htmlFor={id} data-disabled={disabled}>
            <span className={styles.text}>
                <span className={styles.label}>{label}</span>
                {hint && <span className={styles.hint}>{hint}</span>}
            </span>
            <input
                id={id}
                type="checkbox"
                role="switch"
                className={styles.input}
                checked={checked}
                disabled={disabled}
                onChange={e => onChange(e.target.checked)}
            />
            <span className={styles.track} aria-hidden><span className={styles.thumb} /></span>
        </label>
    );
};

export default Toggle;
