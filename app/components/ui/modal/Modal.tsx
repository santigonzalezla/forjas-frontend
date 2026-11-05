'use client';

import {useEffect, type ReactNode} from 'react';
import styles from './modal.module.css';
import {Close} from '@/app/components/svg';

interface ModalProps
{
    open:     boolean;
    title:    string;
    onClose:  () => void;
    children: ReactNode;
    footer?:  ReactNode;
    size?:    'md' | 'lg';
}

// Modal controlado (open/onClose), como los de LegalDocs. Cierra con Escape o clic afuera.
const Modal = ({open, title, onClose, children, footer, size = 'md'}: ModalProps) =>
{
    useEffect(() =>
    {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} data-size={size} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
                        <Close />
                    </button>
                </header>
                <div className={styles.body}>{children}</div>
                {footer && <footer className={styles.footer}>{footer}</footer>}
            </div>
        </div>
    );
};

export default Modal;
