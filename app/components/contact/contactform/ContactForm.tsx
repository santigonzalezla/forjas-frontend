'use client';

import type {FormEvent} from 'react';
import styles from './contactform.module.css';
import Field, {Input, Textarea} from '@/app/components/ui/field/Field';
import Button from '@/app/components/ui/button/Button';
import ConsentCheck from '@/app/components/forms/consentcheck/ConsentCheck';
import Honeypot from '@/app/components/forms/honeypot/Honeypot';
import FormSuccess from '@/app/components/forms/formsuccess/FormSuccess';
import {useQuoteSubmit} from '@/hooks/useQuoteSubmit';

const ContactForm = () =>
{
    const {submit, isLoading, created} = useQuoteSubmit();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        await submit('CONTACT', {
            name:    form.get('name')?.toString().trim(),
            phone:   form.get('phone')?.toString().trim(),
            email:   form.get('email')?.toString().trim(),
            message: form.get('message')?.toString().trim(),
            consent: form.get('consent') === 'true',
            website: form.get('website')?.toString(),
        });
    };

    if (created)
        return (
            <FormSuccess
                title="Mensaje recibido"
                text="Te responderemos por WhatsApp o al celular que dejaste."
                numId={created.numId}
                whatsapp="Hola, acabo de escribirles desde la página web"
            />
        );

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate={false}>
            <div className={styles.row}>
                <Field label="Nombre" htmlFor="name">
                    <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
                </Field>
                <Field label="Celular o WhatsApp" htmlFor="phone">
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required pattern="[+\d\s()\-]{7,20}" />
                </Field>
            </div>
            <Field label="Correo" htmlFor="email" hint="Opcional">
                <Input id="email" name="email" type="email" autoComplete="email" />
            </Field>
            <Field label="¿En qué te podemos ayudar?" htmlFor="message">
                <Textarea id="message" name="message" required maxLength={2000} rows={5} />
            </Field>
            <ConsentCheck />
            <Honeypot />
            <div>
                <Button type="submit" loading={isLoading} loadingText="Enviando…">Enviar mensaje</Button>
            </div>
        </form>
    );
};

export default ContactForm;
