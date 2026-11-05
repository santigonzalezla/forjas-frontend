'use client';

import Link from 'next/link';
import {Suspense, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import table from '@/app/components/admin/admintable/admintable.module.css';
import styles from './quotes.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import StatusBadge from '@/app/components/ui/statusbadge/StatusBadge';
import Field, {Select} from '@/app/components/ui/field/Field';
import {useFetch} from '@/hooks/useFetch';
import {formatCOP} from '@/lib/format';
import {formatDateTime} from '@/lib/dates';
import {QUOTE_KIND_LABELS, QUOTE_STATUS_LABELS, QUOTE_STATUS_TONE, type ApiQuote, type QuoteKind, type QuoteStatus} from '@/app/interfaces/admin';

function QuotesPage()
{
    const searchParams = useSearchParams();
    const [status, setStatus] = useState(searchParams.get('status') ?? '');
    const [kind,   setKind]   = useState(searchParams.get('kind') ?? '');

    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (kind)   query.set('kind', kind);

    const {data: quotes, isLoading} = useFetch<ApiQuote[]>(`quote?${query.toString()}`);

    return (
        <>
            <PageHeader title="Solicitudes" description="Mensajes de contacto, cotizaciones y diseños 3D que llegan desde la página." />

            <div className={styles.filters}>
                <Field label="Estado" htmlFor="status">
                    <Select id="status" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">Todos</option>
                        {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map(value => <option key={value} value={value}>{QUOTE_STATUS_LABELS[value]}</option>)}
                    </Select>
                </Field>
                <Field label="Origen" htmlFor="kind">
                    <Select id="kind" value={kind} onChange={e => setKind(e.target.value)}>
                        <option value="">Todos</option>
                        {(Object.keys(QUOTE_KIND_LABELS) as QuoteKind[]).map(value => <option key={value} value={value}>{QUOTE_KIND_LABELS[value]}</option>)}
                    </Select>
                </Field>
            </div>

            {isLoading && !quotes && <p className={table.empty}>Cargando solicitudes…</p>}
            {quotes?.length === 0 && <p className={table.empty}>No hay solicitudes con estos filtros.</p>}

            {!!quotes?.length && (
                <div className={table.wrapper}>
                    <table className={table.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Origen</th>
                                <th>Trabajo</th>
                                <th>Estimado</th>
                                <th>Recibida</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(quote => (
                                <tr key={quote.id} className={styles.row} data-new={quote.status === 'NEW'}>
                                    <td className={table.muted}>{quote.numId}</td>
                                    <td>
                                        <Link href={`/admin/quotes/${quote.id}`} className={styles.client}>
                                            <span className={table.strong}>{quote.name}</span>
                                            <span className={table.muted}>{quote.phone}{quote.city ? ` · ${quote.city}` : ''}</span>
                                        </Link>
                                    </td>
                                    <td className={table.muted}>{QUOTE_KIND_LABELS[quote.kind]}{quote.attachments.length ? ` · ${quote.attachments.length} foto${quote.attachments.length > 1 ? 's' : ''}` : ''}</td>
                                    <td>{quote.projectType ?? <span className={table.muted}>—</span>}</td>
                                    <td className={table.muted}>{quote.estimateMin !== null && quote.estimateMax !== null ? `${formatCOP(quote.estimateMin)} – ${formatCOP(quote.estimateMax)}` : '—'}</td>
                                    <td className={table.muted}>{formatDateTime(quote.createdAt)}</td>
                                    <td><StatusBadge tone={QUOTE_STATUS_TONE[quote.status]} label={QUOTE_STATUS_LABELS[quote.status]} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

export default function QuotesPageWrapper()
{
    return (
        <Suspense fallback={null}>
            <QuotesPage />
        </Suspense>
    );
}
