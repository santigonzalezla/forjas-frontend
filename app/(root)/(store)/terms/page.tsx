import type {Metadata} from 'next';
import LegalDocument from '@/app/components/legal/legaldocument/LegalDocument';
import {TERMS} from '@/lib/content/legal';

export const metadata: Metadata = {
    title:       'Términos y condiciones',
    description: 'Condiciones de compra, precios, pedidos y entregas en Forjas.',
};

export default function TermsPage()
{
    return <LegalDocument content={TERMS} path="/terms" />;
}
