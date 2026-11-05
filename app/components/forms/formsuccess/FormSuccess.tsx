'use client';

import {useEffect, useRef} from 'react';
import styles from './formsuccess.module.css';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {Check, WhatsApp} from '@/app/components/svg';
import {buildWhatsAppLink} from '@/lib/whatsapp';

interface FormSuccessProps
{
    title:    string;
    text:     string;
    numId?:   number;
    whatsapp: string;
}

// Confirmación tras enviar una solicitud: número de radicado y salida rápida a WhatsApp
const FormSuccess = ({title, text, numId, whatsapp}: FormSuccessProps) =>
{
    const message = numId ? `${whatsapp} (solicitud #${numId})` : whatsapp;
    const ref     = useRef<HTMLDivElement>(null);

    // El formulario desaparece al enviar: se lleva la vista y el foco a la confirmación
    useEffect(() =>
    {
        ref.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
        ref.current?.focus({preventScroll: true});
    }, []);

    return (
        <div ref={ref} className={styles.success} role="status" tabIndex={-1}>
            <span className={styles.icon}><Check /></span>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.text}>{text}</p>
            {numId && <p className={styles.number}>Solicitud #{numId}</p>}
            <ButtonLink href={buildWhatsAppLink(message)} external icon={<WhatsApp />} variant="secondary">Escribir por WhatsApp</ButtonLink>
        </div>
    );
};

export default FormSuccess;
