'use client';

import {createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode} from 'react';
import {API_BASE_URL} from '@/lib/constants';
import {hydrationStore} from '@/lib/localStore';
import type {SessionUser} from '@/app/interfaces/admin';

interface AuthContextType
{
    accessToken:        string | null;
    user:               SessionUser | null;
    isAuthenticated:    boolean;
    isHydrated:         boolean;
    login:              (email: string, password: string) => Promise<string | null>;
    logout:             () => Promise<void>;
    refreshAccessToken: () => Promise<string | null>;
}

let refreshInFlight: Promise<string | null> | null = null;

const requestRefresh = (): Promise<string | null> =>
{
    refreshInFlight ??= fetch(`${API_BASE_URL}/auth/refresh`, {method: 'POST', credentials: 'include'})
        .then(async response => (response.ok ? ((await response.json()) as {accessToken: string}).accessToken : null))
        .catch(() => null)
        .finally(() => { refreshInFlight = null; });

    return refreshInFlight;
};

const fetchMe = async (token: string): Promise<SessionUser | null> =>
{
    const response = await fetch(`${API_BASE_URL}/auth/me`, {headers: {Authorization: `Bearer ${token}`}, cache: 'no-store'});
    return response.ok ? (await response.json()) as SessionUser : null;
};

const SESSION_HINT = 'fj_has_session';

const hasSessionHint = (): boolean =>
{
    try { return localStorage.getItem(SESSION_HINT) === '1'; }
    catch { return false; }
};

const noopSubscribe = () => () => {};

const setSessionHint = (active: boolean): void =>
{
    try
    {
        if (active) localStorage.setItem(SESSION_HINT, '1');
        else        localStorage.removeItem(SESSION_HINT);
    }
    catch
    {
    }
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: ReactNode})
{
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user,        setUser]        = useState<SessionUser | null>(null);
    const [refreshDone, setRefreshDone] = useState(false);

    const mounted    = useSyncExternalStore(hydrationStore.subscribe, hydrationStore.getSnapshot, hydrationStore.getServerSnapshot);
    const hasHint    = useSyncExternalStore(noopSubscribe, hasSessionHint, () => false);
    const isHydrated = mounted && (!hasHint || refreshDone);

    useEffect(() =>
    {
        if (!hasHint) return;
        let cancelled = false;

        requestRefresh()
            .then(async token =>
            {
                if (cancelled) return;
                if (!token) return setSessionHint(false);
                const me = await fetchMe(token);
                if (cancelled) return;
                setAccessToken(token);
                setUser(me);
            })
            .finally(() => { if (!cancelled) setRefreshDone(true); });

        return () => { cancelled = true; };
    }, [hasHint]);

    const login = useCallback(async (email: string, password: string): Promise<string | null> =>
    {
        try
        {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method:      'POST',
                headers:     {'Content-Type': 'application/json'},
                credentials: 'include',
                body:        JSON.stringify({email, password}),
            });

            if (!response.ok)
            {
                const data = await response.json().catch(() => ({}));
                return response.status === 429
                    ? 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.'
                    : (Array.isArray(data.message) ? data.message.join(', ') : data.message) ?? 'No fue posible iniciar sesión';
            }

            const {accessToken: token} = await response.json() as {accessToken: string};
            setSessionHint(true);
            setAccessToken(token);
            setUser(await fetchMe(token));
            return null;
        }
        catch
        {
            return 'No fue posible conectar con el servidor';
        }
    }, []);

    const logout = useCallback(async () =>
    {
        await fetch(`${API_BASE_URL}/auth/logout`, {method: 'POST', credentials: 'include'}).catch(() => undefined);
        setSessionHint(false);
        setAccessToken(null);
        setUser(null);
    }, []);

    const refreshAccessToken = useCallback(async (): Promise<string | null> =>
    {
        const token = await requestRefresh();
        setAccessToken(token);
        if (!token)
        {
            setUser(null);
            setSessionHint(false);
        }
        return token;
    }, []);

    return (
        <AuthContext.Provider value={{
            accessToken,
            user,
            isAuthenticated: !!accessToken && !!user,
            isHydrated,
            login,
            logout,
            refreshAccessToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType
{
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
