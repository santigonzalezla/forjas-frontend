'use client';

import {useEffect, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/context/AuthContext';
import {UserRole} from '@/app/interfaces/admin';

const AdminGuard = ({children}: {children: ReactNode}) =>
{
    const {isHydrated, isAuthenticated, user} = useAuth();
    const router = useRouter();

    const allowed = isAuthenticated && (user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR);

    useEffect(() =>
    {
        if (!isHydrated || allowed) return;
        router.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
    }, [isHydrated, allowed, router]);

    return <div style={{display: allowed ? 'contents' : 'none'}} aria-hidden={!allowed}>{children}</div>;
};

export default AdminGuard;
