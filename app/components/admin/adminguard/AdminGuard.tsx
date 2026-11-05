'use client';

import {useEffect, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/context/AuthContext';
import {UserRole} from '@/app/interfaces/admin';

// Protege el panel: sin sesión manda al login; un cliente (CUSTOMER) no entra.
// El contenido se renderiza siempre (Next necesita el árbol para validar la navegación
// instantánea) pero queda oculto hasta confirmar la sesión, y useFetch no pide datos sin token.
const AdminGuard = ({children}: {children: ReactNode}) =>
{
    const {isHydrated, isAuthenticated, user} = useAuth();
    const router = useRouter();

    const allowed = isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR);

    useEffect(() =>
    {
        if (!isHydrated || allowed) return;
        // La ruta se lee aquí y no con usePathname: así el guard no bloquea el prerender
        router.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
    }, [isHydrated, allowed, router]);

    return <div style={{display: allowed ? 'contents' : 'none'}} aria-hidden={!allowed}>{children}</div>;
};

export default AdminGuard;
