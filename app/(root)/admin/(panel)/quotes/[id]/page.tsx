'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Suspense, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {toast} from 'sonner';
import styles from '../quotes.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import StatusBadge from '@/app/components/ui/statusbadge/StatusBadge';
import Button from '@/app/components/ui/button/Button';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import ConfirmModal from '@/app/components/ui/confirmmodal/ConfirmModal';
import Field, {Select, Textarea} from '@/app/components/ui/field/Field';
import {External, Trash, WhatsApp} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useConfirm} from '@/hooks/useConfirm';
import {useErrorToast} from '@/hooks/useErrorToast';
import {useAuth} from '@/context/AuthContext';
import {formatCOP} from '@/lib/format';
import {formatDateTime, formatDay} from '@/lib/dates';
import {defaultDesign, describeDesign, designToQuery, normalizeDesign, type Design} from '@/lib/configurator';
import {QUOTE_KIND_LABELS, QUOTE_STATUS_LABELS, QUOTE_STATUS_TONE, UserRole, type ApiQuote, type QuoteStatus} from '@/app/interfaces/admin';

// El celular puede venir con espacios o sin indicativo: wa.me necesita 57 + número
const toWhatsAppNumber = (phone: string) =>
{
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 ? `57${digits}` : digits;
};

// Estado y notas: se editan juntos y se guardan con un solo botón
const FollowUp = ({quote, onSaved}: {quote: ApiQuote; onSaved: () => void}) =>
{
    const [status, setStatus] = useState<QuoteStatus>(quote.status);
    const [notes,  setNotes]  = useState(quote.adminNotes ?? '');

    const {execute: update, isLoading: saving, error} = useFetch<ApiQuote>(`quote/${quote.id}`, {method: 'PATCH', immediate: false});
    useErrorToast(error);

    const dirty = status !== quote.status || notes !== (quote.adminNotes ?? '');

    const save = async () =>
    {
        if (!await update({body: {status, adminNotes: notes.trim() || null}})) return;
        toast.success('Solicitud actualizada');
        onSaved();
    };

    return (
        <section className={styles.card}>
            <h2 className={styles.cardTitle}>Seguimiento</h2>
            <Field label="Estado" htmlFor="status">
                <Select id="status" value={status} onChange={e => setStatus(e.target.value as QuoteStatus)}>
                    {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map(value => <option key={value} value={value}>{QUOTE_STATUS_LABELS[value]}</option>)}
                </Select>
            </Field>
            <Field label="Notas internas" htmlFor="notes" hint="Solo las ve el equipo.">
                <Textarea id="notes" maxLength={2000} rows={5} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Visita agendada, valor cotizado, materiales…" />
            </Field>
            <Button onClick={save} loading={saving} disabled={!dirty}>Guardar</Button>
        </section>
    );
};

function QuoteDetail()
{
    const {id}   = useParams<{id: string}>();
    const router = useRouter();
    const {user} = useAuth();

    const {data: quote, execute: reload, error: loadError} = useFetch<ApiQuote>(`quote/${id}`);
    const {execute: remove, error: removeError}            = useFetch<unknown>(`quote/${id}`, {method: 'DELETE', immediate: false});
    const {confirm, confirmState, handleConfirm, handleCancel} = useConfirm();
    useErrorToast(removeError);

    if (loadError) return <p className={styles.state}>No encontramos esta solicitud. <Link href="/admin/quotes">Volver a solicitudes</Link></p>;
    if (!quote) return <p className={styles.state}>Cargando…</p>;

    // Las solicitudes viejas no traen tamaño, patrón ni colores: se completan con los valores de la pieza
    const stored = quote.design as unknown as (Partial<Design> & {type: Design['type']}) | null;
    const base   = stored ? defaultDesign(stored.type) : null;
    const design = stored && base ? normalizeDesign({...base, ...stored, colors: {...base.colors, ...stored.colors}}) : null;

    const facts = [
        {label: 'Celular', value: quote.phone},
        {label: 'Correo', value: quote.email},
        {label: 'Ciudad', value: quote.city},
        {label: 'Trabajo', value: quote.projectType},
        {label: 'Medidas', value: quote.widthCm || quote.heightCm ? `${quote.widthCm ?? '?'} × ${quote.heightCm ?? '?'} cm` : null},
        {label: 'Visita sugerida', value: quote.preferredDate ? formatDay(quote.preferredDate) : null},
    ].filter((fact): fact is {label: string; value: string} => !!fact.value);

    const handleDelete = async () =>
    {
        if (!await confirm({title: 'Eliminar solicitud', message: `La solicitud #${quote.numId} de ${quote.name} saldrá de la lista.`, confirmLabel: 'Eliminar'})) return;
        if (await remove() === null) return;
        toast.success('Solicitud eliminada');
        router.replace('/admin/quotes');
    };

    return (
        <>
            <PageHeader
                title={`#${quote.numId} · ${quote.name}`}
                description={`${QUOTE_KIND_LABELS[quote.kind]} recibida el ${formatDateTime(quote.createdAt)}`}
                actions={<StatusBadge tone={QUOTE_STATUS_TONE[quote.status]} label={QUOTE_STATUS_LABELS[quote.status]} />}
            />

            <div className={styles.layout}>
                <div className={styles.main}>
                    <section className={styles.card}>
                        <h2 className={styles.cardTitle}>Datos</h2>
                        <dl className={styles.facts}>
                            {facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
                            {quote.productSlug && <div><dt>Producto</dt><dd><Link href={`/shop/${quote.productSlug}`} target="_blank">{quote.productSlug}</Link></dd></div>}
                        </dl>
                        {quote.message && <p className={styles.message}>{quote.message}</p>}
                    </section>

                    {design && (
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}>Diseño 3D</h2>
                            <p>{describeDesign(design)}</p>
                            {quote.estimateMin !== null && quote.estimateMax !== null && (
                                <p><span className={styles.estimate}>{formatCOP(quote.estimateMin)} – {formatCOP(quote.estimateMax)}</span><br /><span className={styles.muted}>Estimado con las tarifas vigentes el día de la solicitud.</span></p>
                            )}
                            <div><ButtonLink href={`/design?${designToQuery(design)}`} variant="secondary" external icon={<External />}>Abrir en el configurador</ButtonLink></div>
                        </section>
                    )}

                    {quote.attachments.length > 0 && (
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}>Fotos ({quote.attachments.length})</h2>
                            <div className={styles.photos}>
                                {quote.attachments.map((photo, index) => (
                                    <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className={styles.photo}>
                                        <Image src={photo.url} alt={`Foto ${index + 1} de la solicitud`} fill sizes="200px" />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className={styles.side}>
                    <section className={styles.card}>
                        <h2 className={styles.cardTitle}>Responder</h2>
                        <div className={styles.contact}>
                            <ButtonLink href={`https://wa.me/${toWhatsAppNumber(quote.phone)}?text=${encodeURIComponent(`Hola ${quote.name.split(' ')[0]}, te escribimos de Forjas por tu solicitud #${quote.numId}.`)}`} external icon={<WhatsApp />}>WhatsApp</ButtonLink>
                            {quote.email && <ButtonLink href={`mailto:${quote.email}?subject=${encodeURIComponent(`Forjas · Solicitud #${quote.numId}`)}`} variant="secondary" external>Correo</ButtonLink>}
                        </div>
                    </section>

                    {/* key: tras guardar, el formulario toma los valores del servidor */}
                    <FollowUp key={`${quote.status}-${quote.adminNotes ?? ''}`} quote={quote} onSaved={reload} />

                    {user?.role === UserRole.ADMIN && (
                        <Button variant="danger" icon={<Trash />} onClick={handleDelete}>Eliminar solicitud</Button>
                    )}
                </aside>
            </div>

            {confirmState && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
        </>
    );
}

export default function QuoteDetailPage()
{
    return (
        <Suspense fallback={<p className={styles.state}>Cargando…</p>}>
            <QuoteDetail />
        </Suspense>
    );
}
