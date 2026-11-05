import type {Metadata} from 'next';
import LegalDocument from '@/app/components/legal/legaldocument/LegalDocument';
import {PRIVACY} from '@/lib/content/legal';

export const metadata: Metadata = {
    title:       'Tratamiento de datos',
    description: 'Política de tratamiento de datos personales de Forjas (Ley 1581 de 2012).',
};

export default function PrivacyPage()
{
    return <LegalDocument content={PRIVACY} path="/privacy" />;
}
