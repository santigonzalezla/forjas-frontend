import styles from './quantitystepper.module.css';

interface QuantityStepperProps
{
    value:    number;
    onChange: (value: number) => void;
    min?:     number;
    max?:     number;
    label:    string;
}

const QuantityStepper = ({value, onChange, min = 1, max = 20, label}: QuantityStepperProps) =>
{
    return (
        <div className={styles.stepper} role="group" aria-label={label}>
            <button type="button" className={styles.button} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Quitar una">−</button>
            <span className={styles.value} aria-live="polite">{value}</span>
            <button type="button" className={styles.button} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Agregar una">+</button>
        </div>
    );
};

export default QuantityStepper;
