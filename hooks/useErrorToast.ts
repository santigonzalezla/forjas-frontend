'use client';

import {useEffect} from 'react';
import {toast} from 'sonner';

// Muestra como toast el error que deja useFetch (patrón del login de LegalDocs).
// Se usa en lugar de leer `error` justo después de execute, cuando aún no se actualizó.
export function useErrorToast(error: string | null)
{
    useEffect(() =>
    {
        if (error) toast.error(error);
    }, [error]);
}
