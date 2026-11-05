'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Suspense} from 'react';
import styles from './adminsidebar.module.css';
import Logo from '@/app/components/layout/logo/Logo';
import {Box, External, Grid, ImageIcon, Inbox, Sliders, Sparkle, Tag, Users} from '@/app/components/svg';
import {useAuth} from '@/context/AuthContext';
import {UserRole} from '@/app/interfaces/admin';

const NAV = [
    {href: '/admin',              label: 'Resumen',         icon: Grid,      adminOnly: false},
    {href: '/admin/quotes',       label: 'Solicitudes',     icon: Inbox,     adminOnly: false},
    {href: '/admin/products',     label: 'Productos',       icon: Box,       adminOnly: false},
    {href: '/admin/categories',   label: 'Categorías',      icon: Tag,       adminOnly: false},
    {href: '/admin/projects',     label: 'Proyectos',       icon: ImageIcon, adminOnly: false},
    {href: '/admin/pieces',       label: 'Piezas del hero', icon: Sparkle,   adminOnly: false},
    {href: '/admin/configurator', label: 'Configurador 3D', icon: Sliders,   adminOnly: true},
    {href: '/admin/users',        label: 'Equipo',          icon: Users,     adminOnly: true},
];

interface AdminSidebarProps
{
    open:    boolean;
    onClose: () => void;
}

interface NavListProps
{
    isAdmin:   boolean;
    onNavigate: () => void;
    pathname?: string; // sin ruta (durante el prerender) ningún enlace se marca activo
}

const NavList = ({isAdmin, onNavigate, pathname}: NavListProps) =>
{
    const isActive = (href: string) =>
        !!pathname && (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

    return (
        <nav className={styles.nav} aria-label="Panel">
            {NAV.filter(item => !item.adminOnly || isAdmin).map(({href, label, icon: Icon}) => (
                <Link key={href} href={href} className={styles.link} data-active={isActive(href)} onClick={onNavigate}>
                    <Icon />
                    {label}
                </Link>
            ))}
        </nav>
    );
};

// usePathname depende de la URL: va dentro de Suspense para no bloquear el prerender
const ActiveNavList = (props: Omit<NavListProps, 'pathname'>) => <NavList {...props} pathname={usePathname()} />;

const AdminSidebar = ({open, onClose}: AdminSidebarProps) =>
{
    const {user}  = useAuth();
    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <>
            <div className={styles.backdrop} data-open={open} onClick={onClose} aria-hidden />
            <aside className={styles.sidebar} data-open={open}>
                <Link href="/admin" className={styles.brand} onClick={onClose}>
                    <Logo />
                    <span className={styles.brandTag}>Panel</span>
                </Link>

                <Suspense fallback={<NavList isAdmin={isAdmin} onNavigate={onClose} />}>
                    <ActiveNavList isAdmin={isAdmin} onNavigate={onClose} />
                </Suspense>

                <a href="/" target="_blank" rel="noopener noreferrer" className={styles.storeLink}>
                    <External />
                    Ver la tienda
                </a>
            </aside>
        </>
    );
};

export default AdminSidebar;
