import type {Metadata} from 'next';
import {Suspense} from 'react';
import styles from './quote.module.css';
import QuoteWizard from '@/app/components/quote/quotewizard/QuoteWizard';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {WhatsApp} from '@/app/components/svg';
import {QUOTE_TYPES, guessTypeFromPiece} from '@/lib/content/quote';
import {buildWhatsAppLink} from '@/lib/whatsapp';
import {getProductBySlug} from '@/services/queries/catalog';

export const metadata: Metadata = {
    title:       'Cotizar',
    description: 'Pide la cotización de un portón, reja, baranda, mueble o restauración. Puedes adjuntar fotos y agendar una visita técnica.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// Lee ?type= y ?piece= (producto de la tienda) y arma el estado inicial del asistente
const Wizard = async ({searchParams}: {searchParams: SearchParams}) =>
{
    const params  = await searchParams;
    const slug    = first(params.piece);
    const product = slug ? await getProductBySlug(slug) : null;

    const requested   = first(params.type) ?? (product ? guessTypeFromPiece(product.slug) : undefined);
    const initialType = QUOTE_TYPES.some(type => type.id === requested) ? requested : undefined;

    return (
        <QuoteWizard
            key={`${initialType ?? ''}-${product?.slug ?? ''}`}
            initialType={initialType}
            product={product ? {slug: product.slug, name: product.name} : undefined}
        />
    );
};

export default function QuotePage({searchParams}: PageProps<'/quote'>)
{
    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Cotiza tu pieza</h1>
                <p className={styles.lead}>Con unas medidas aproximadas y un par de fotos podemos darte un primer valor. Si hace falta, agendamos una visita técnica para medir.</p>
                <div className={styles.aside}>
                    <p>¿Prefieres hablar?</p>
                    <ButtonLink href={buildWhatsAppLink('Hola, quiero cotizar un trabajo en hierro.')} external icon={<WhatsApp />} variant="secondary">WhatsApp</ButtonLink>
                </div>
            </header>
            <section className={styles.body}>
                <Suspense fallback={<div className={styles.fallback} aria-busy="true" />}>
                    <Wizard searchParams={searchParams} />
                </Suspense>
            </section>
        </div>
    );
}
