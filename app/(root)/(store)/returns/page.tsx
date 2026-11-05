import type {Metadata} from 'next';
import LegalDocument from '@/app/components/legal/legaldocument/LegalDocument';
import {RETURNS} from '@/lib/content/legal';

export const metadata: Metadata = {
    title:       'Cambios y garantías',
    description: 'Derecho de retracto, reversión del pago y garantía legal en Forjas.',
};

export default function ReturnsPage()
{
    return <LegalDocument content={RETURNS} path="/returns" />;
}
