import type {ButtonHTMLAttributes, ReactNode} from 'react';
import styles from './button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
    variant?: Variant;
    icon?:    ReactNode;
    loading?: boolean;
    loadingText?: string;
}

const Button = ({variant = 'primary', icon, loading = false, loadingText = 'Guardando…', children, disabled, type = 'button', ...rest}: ButtonProps) =>
{
    return (
        <button type={type} className={styles.button} data-variant={variant} disabled={disabled || loading} aria-busy={loading} {...rest}>
            {icon}
            {children && <span>{loading ? loadingText : children}</span>}
        </button>
    );
};

export default Button;
