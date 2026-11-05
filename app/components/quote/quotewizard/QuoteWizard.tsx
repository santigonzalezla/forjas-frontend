'use client';

import {useState, type FormEvent} from 'react';
import {toast} from 'sonner';
import styles from './quotewizard.module.css';
import Field, {Input, Textarea} from '@/app/components/ui/field/Field';
import Button from '@/app/components/ui/button/Button';
import ConsentCheck from '@/app/components/forms/consentcheck/ConsentCheck';
import Honeypot from '@/app/components/forms/honeypot/Honeypot';
import FormSuccess from '@/app/components/forms/formsuccess/FormSuccess';
import PhotoPicker, {type PickedPhoto} from '@/app/components/forms/photopicker/PhotoPicker';
import {useQuoteSubmit} from '@/hooks/useQuoteSubmit';
import {QUOTE_TYPES} from '@/lib/content/quote';

interface QuoteWizardProps
{
    initialType?: string;
    product?:     {slug: string; name: string};
}

const STEPS = ['Tipo de trabajo', 'Detalles', 'Tus datos'] as const;

interface Details
{
    widthCm:  string;
    heightCm: string;
    message:  string;
}

interface Contact
{
    name:          string;
    phone:         string;
    email:         string;
    city:          string;
    preferredDate: string;
}

const todayIso = () =>
{
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const QuoteWizard = ({initialType, product}: QuoteWizardProps) =>
{
    const [step,    setStep]    = useState(initialType ? 1 : 0);
    const [typeId,  setTypeId]  = useState(initialType ?? '');
    const [details, setDetails] = useState<Details>({widthCm: '', heightCm: '', message: ''});
    const [photos,  setPhotos]  = useState<PickedPhoto[]>([]);
    const [contact, setContact] = useState<Contact>({name: '', phone: '', email: '', city: 'Valledupar', preferredDate: ''});

    const {submit, isLoading, created} = useQuoteSubmit();
    const type = QUOTE_TYPES.find(option => option.id === typeId);

    const chooseType = (id: string) =>
    {
        setTypeId(id);
        setStep(1);
    };

    const handleDetails = (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        if (type?.id === 'restoration' && photos.length === 0)
        {
            toast.error('Para cotizar una restauración necesitamos al menos una foto del mueble');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        if (contact.preferredDate && contact.preferredDate < todayIso())
        {
            toast.error('La fecha de visita no puede estar en el pasado');
            return;
        }

        await submit('QUOTE', {
            projectType:   type?.label,
            productSlug:   product?.slug,
            widthCm:       type?.measures ? details.widthCm : undefined,
            heightCm:      type?.measures ? details.heightCm : undefined,
            message:       details.message.trim(),
            name:          contact.name.trim(),
            phone:         contact.phone.trim(),
            email:         contact.email.trim(),
            city:          contact.city.trim(),
            preferredDate: contact.preferredDate,
            consent:       form.get('consent') === 'true',
            website:       form.get('website')?.toString(),
        }, photos.map(photo => photo.file));
    };

    if (created)
        return (
            <FormSuccess
                title="Solicitud recibida"
                text="Revisamos tu solicitud y te contactamos para afinar detalles, agendar la visita técnica si hace falta y enviarte la cotización."
                numId={created.numId}
                whatsapp="Hola, acabo de enviar una solicitud de cotización desde la página web"
            />
        );

    return (
        <div className={styles.wizard}>
            <ol className={styles.progress} aria-label="Pasos">
                {STEPS.map((label, index) => (
                    <li key={label} data-state={index < step ? 'done' : index === step ? 'current' : 'next'} aria-current={index === step ? 'step' : undefined}>
                        {index < step
                            ? <button type="button" onClick={() => setStep(index)} className={styles.stepLink}>{label}</button>
                            : <span>{label}</span>}
                    </li>
                ))}
            </ol>

            {product && <p className={styles.product}>Sobre <strong>{product.name}</strong></p>}

            {step === 0 && (
                <div className={styles.types} role="radiogroup" aria-label="Tipo de trabajo">
                    {QUOTE_TYPES.map(option => (
                        <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={option.id === typeId}
                            className={styles.type}
                            data-active={option.id === typeId}
                            onClick={() => chooseType(option.id)}
                        >
                            <span className={styles.typeLabel}>{option.label}</span>
                            <span className={styles.typeHint}>{option.hint}</span>
                        </button>
                    ))}
                </div>
            )}

            {step === 1 && type && (
                <form className={styles.form} onSubmit={handleDetails}>
                    <p className={styles.selected}>{type.label} <button type="button" className={styles.change} onClick={() => setStep(0)}>Cambiar</button></p>

                    {type.measures && (
                        <div className={styles.row}>
                            <Field label="Ancho aproximado (cm)" htmlFor="widthCm" hint="Opcional">
                                <Input id="widthCm" type="number" inputMode="numeric" min={10} max={5000} value={details.widthCm} onChange={event => setDetails({...details, widthCm: event.target.value})} />
                            </Field>
                            <Field label="Alto aproximado (cm)" htmlFor="heightCm" hint="Opcional">
                                <Input id="heightCm" type="number" inputMode="numeric" min={10} max={5000} value={details.heightCm} onChange={event => setDetails({...details, heightCm: event.target.value})} />
                            </Field>
                        </div>
                    )}

                    <Field label="Cuéntanos del trabajo" htmlFor="message" hint="Estilo, uso, lugar de instalación o cualquier detalle que te importe.">
                        <Textarea id="message" required maxLength={2000} rows={5} value={details.message} onChange={event => setDetails({...details, message: event.target.value})} />
                    </Field>

                    <div className={styles.photos}>
                        <span className={styles.photosLabel}>Fotos {type.id === 'restoration' ? '' : '(opcional)'}</span>
                        <p className={styles.photosHint}>{type.id === 'restoration' ? 'Del mueble completo y de los detalles dañados.' : 'Del espacio donde va la pieza o de una referencia que te guste.'}</p>
                        <PhotoPicker photos={photos} onChange={setPhotos} />
                    </div>

                    <div className={styles.actions}>
                        <Button type="button" variant="ghost" onClick={() => setStep(0)}>Atrás</Button>
                        <Button type="submit">Continuar</Button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <Field label="Nombre" htmlFor="name">
                            <Input id="name" autoComplete="name" required minLength={2} maxLength={80} value={contact.name} onChange={event => setContact({...contact, name: event.target.value})} />
                        </Field>
                        <Field label="Celular o WhatsApp" htmlFor="phone">
                            <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" required pattern="[+\d\s()\-]{7,20}" value={contact.phone} onChange={event => setContact({...contact, phone: event.target.value})} />
                        </Field>
                    </div>
                    <div className={styles.row}>
                        <Field label="Correo" htmlFor="email" hint="Opcional">
                            <Input id="email" type="email" autoComplete="email" value={contact.email} onChange={event => setContact({...contact, email: event.target.value})} />
                        </Field>
                        <Field label="Ciudad" htmlFor="city">
                            <Input id="city" autoComplete="address-level2" maxLength={80} value={contact.city} onChange={event => setContact({...contact, city: event.target.value})} />
                        </Field>
                    </div>
                    <Field label="Fecha sugerida para la visita técnica" htmlFor="preferredDate" hint="Opcional. La confirmamos contigo por WhatsApp.">
                        <Input id="preferredDate" type="date" value={contact.preferredDate} onChange={event => setContact({...contact, preferredDate: event.target.value})} />
                    </Field>
                    <ConsentCheck />
                    <Honeypot />
                    <div className={styles.actions}>
                        <Button type="button" variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                        <Button type="submit" loading={isLoading} loadingText="Enviando…">Enviar solicitud</Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default QuoteWizard;
