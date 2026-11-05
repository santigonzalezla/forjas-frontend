'use client';

// Basado en el useFetch de LegalDocs: único punto de llamadas al backend desde el
// cliente (carrito, checkout, cotizaciones, cuenta y panel /admin).

import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {useAuth} from '@/context/AuthContext';
import {API_BASE_URL} from '@/lib/constants';

export interface UseFetchOptions
{
    method?:       'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?:         unknown;
    headers?:      Record<string, string>;
    immediate?:    boolean;
    responseType?: 'json' | 'blob';
    isFormData?:   boolean;
    requiresAuth?: boolean; // por defecto true: la carga inicial espera a tener access token
}

export interface UseFetchResult<T>
{
    data:      T | null;
    isLoading: boolean;
    error:     string | null;
    execute:   (overrideOptions?: Partial<UseFetchOptions>, overrideUrl?: string) => Promise<T | null>;
    reset:     () => void;
}

export function useFetch<T = unknown>(url: string, options: UseFetchOptions = {}): UseFetchResult<T>
{
    const immediate    = options.immediate ?? true;
    const requiresAuth = options.requiresAuth ?? true;

    const [data,      setData]      = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(immediate);
    const [error,     setError]     = useState<string | null>(null);

    const {accessToken, logout, refreshAccessToken, isHydrated} = useAuth();

    // Las opciones viven en un ref: así execute no cambia de identidad en cada render
    // (en LegalDocs se resolvía serializando body/headers dentro de un useMemo).
    const optionsRef = useRef(options);
    useEffect(() =>
    {
        optionsRef.current = options;
    });

    const execute = useCallback(async (
        overrideOptions: Partial<UseFetchOptions> = {},
        overrideUrl?: string,
    ): Promise<T | null> =>
    {
        setIsLoading(true);
        setError(null);

        const merged     = {...optionsRef.current, ...overrideOptions};
        const urlToUse   = overrideUrl ?? url;
        const isFormData = merged.isFormData ?? false;

        const doRequest = async (token: string | null): Promise<Response> =>
        {
            const headers: Record<string, string> = {...merged.headers};

            if (!isFormData) headers['Content-Type']  = 'application/json';
            if (token)       headers['Authorization'] = `Bearer ${token}`;

            const fetchOptions: RequestInit = {
                method:  merged.method ?? 'GET',
                headers,
                // API autenticada: nunca servir desde la caché del navegador (Safari
                // cacheaba GET de forma heurística y las listas no se refrescaban).
                cache:   'no-store',
            };

            if (merged.body && merged.method !== 'GET')
                fetchOptions.body = isFormData
                    ? merged.body as FormData
                    : JSON.stringify(merged.body);

            return fetch(`${API_BASE_URL}/${urlToUse}`, fetchOptions);
        };

        try
        {
            let response = await doRequest(accessToken);

            // Access token vencido: se renueva con la cookie httpOnly y se reintenta una vez
            if (response.status === 401 && accessToken)
            {
                const newToken = await refreshAccessToken();

                if (!newToken)
                {
                    await logout();
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }

                response = await doRequest(newToken);

                if (response.status === 401)
                {
                    await logout();
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }
            }

            if (!response.ok)
            {
                const errorData = await response.json().catch(() => ({}));
                const message   = Array.isArray(errorData.message)
                    ? errorData.message.join(', ')
                    : (errorData.message ?? `Error ${response.status}: ${response.statusText}`);

                if (response.status === 403)
                    toast.error(message, {description: 'Tu usuario no tiene permiso para esta acción.'});

                throw new Error(message);
            }

            let responseData: T;
            if (merged.responseType === 'blob')
            {
                responseData = await response.blob() as T;
            }
            else
            {
                const text = await response.text();
                responseData = text.length > 0 ? JSON.parse(text) : null as unknown as T;
            }

            setData(responseData);
            return responseData;
        }
        catch (e)
        {
            const msg = e instanceof Error ? e.message : 'Error desconocido al realizar la solicitud';
            setError(msg);
            console.error('[useFetch]', msg);
            return null;
        }
        finally
        {
            setIsLoading(false);
        }
    }, [url, accessToken, logout, refreshAccessToken]);

    const reset = useCallback(() =>
    {
        setData(null);
        setIsLoading(false);
        setError(null);
    }, []);

    useEffect(() =>
    {
        if (!immediate || !isHydrated) return;
        // Sin sesión no se piden datos protegidos (evita 401 mientras el guard redirige)
        if (requiresAuth && !accessToken) return;
        // Sincroniza con un sistema externo (la API): es el uso legítimo de un efecto.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        execute();
    }, [execute, immediate, isHydrated, requiresAuth, accessToken]);

    return {data, isLoading, error, execute, reset};
}
