import type {InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes} from 'react';
import styles from './field.module.css';

interface FieldProps
{
    label:     string;
    htmlFor:   string;
    hint?:     string;
    error?:    string | null;
    children:  ReactNode;
    className?: string;
}

const Field = ({label, htmlFor, hint, error, children, className = ''}: FieldProps) =>
{
    return (
        <div className={`${styles.field} ${className}`}>
            <label className={styles.label} htmlFor={htmlFor}>{label}</label>
            {children}
            {error
                ? <p className={styles.error} role="alert">{error}</p>
                : hint && <p className={styles.hint}>{hint}</p>}
        </div>
    );
};

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input className={styles.control} {...props} />;

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select className={`${styles.control} ${styles.select}`} {...props} />;

export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className={`${styles.control} ${styles.textarea}`} {...props} />;

export default Field;
