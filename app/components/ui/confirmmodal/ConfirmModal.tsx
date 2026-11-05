'use client';

import styles from './confirmmodal.module.css';
import Button from '@/app/components/ui/button/Button';
import {Alert} from '@/app/components/svg';

interface ConfirmModalProps
{
    title:         string;
    message:       string;
    confirmLabel?: string;
    danger?:       boolean;
    onConfirm:     () => void;
    onCancel:      () => void;
}

// Igual que el ConfirmModal de LegalDocs: se usa junto al hook useConfirm
const ConfirmModal = ({title, message, confirmLabel = 'Eliminar', danger = true, onConfirm, onCancel}: ConfirmModalProps) =>
{
    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} role="alertdialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
                <div className={styles.iconWrap} data-danger={danger}>
                    <Alert />
                </div>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
