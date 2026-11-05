'use client';

import {useFetch} from '@/hooks/useFetch';
import {useErrorToast} from '@/hooks/useErrorToast';

export type QuoteKind = 'CONTACT' | 'QUOTE' | 'DESIGN';

export interface QuoteCreated
{
    id:       string;
    numId:    number;
    estimate: {min: number; max: number} | null;
}

// Envía una solicitud pública (contacto, cotización o diseño 3D) como multipart,
// porque puede llevar fotos. Los campos vacíos no se mandan para no chocar con la validación.
export function useQuoteSubmit()
{
    const {execute, isLoading, error, data} = useFetch<QuoteCreated>('quote', {method: 'POST', immediate: false, requiresAuth: false, isFormData: true});
    useErrorToast(error);

    const submit = (kind: QuoteKind, fields: Record<string, string | number | boolean | object | undefined | null>, photos: File[] = []) =>
    {
        const body = new FormData();
        body.append('kind', kind);

        for (const [key, value] of Object.entries(fields))
        {
            if (value === undefined || value === null || value === '') continue;
            body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }

        photos.forEach(photo => body.append('photos', photo));
        return execute({body});
    };

    return {submit, isLoading, created: data};
}
