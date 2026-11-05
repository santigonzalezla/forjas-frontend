'use client';

import Link from 'next/link';
import {Suspense, useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import styles from './header.module.css';
import Logo from '@/app/components/layout/logo/Logo';
import ThemeToggle from '@/app/components/layout/themetoggle/ThemeToggle';
import {Close, Menu, Search, User} from '@/app/components/svg';
import {useCart} from '@/context/CartContext';

const NAV_LINKS = [
    {href: '/shop',    label: 'Tienda'},
    {href: '/design',    label: 'Diseña en 3D'},
    {href: '/services', label: 'Servicios'},
    {href: '/projects', label: 'Proyectos'},
    {href: '/about',  label: 'Nosotros'},
];

interface NavLinksProps
{
    linkClass: string;
    onNavigate?: () => void;
    pathname?: string; // sin ruta (durante el prerender) ningún enlace se marca activo
}

// La sección actual queda marcada: /shop/mesa-nido sigue siendo "Tienda"
const NavLinks = ({linkClass, onNavigate, pathname}: NavLinksProps) =>
    NAV_LINKS.map(link =>
    {
        const active = !!pathname && (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
            <Link key={link.href} href={link.href} className={linkClass} data-active={active} aria-current={active ? 'page' : undefined} onClick={onNavigate}>
                {link.label}
            </Link>
        );
    });

// usePathname depende de la URL: va dentro de Suspense para no bloquear el prerender
const ActiveNavLinks = (props: Omit<NavLinksProps, 'pathname'>) => <NavLinks {...props} pathname={usePathname()} />;

const NavList = (props: Omit<NavLinksProps, 'pathname'>) => (
    <Suspense fallback={<NavLinks {...props} />}>
        <ActiveNavLinks {...props} />
    </Suspense>
);

const Header = () =>
{
    const {count}                 = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() =>
    {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, {passive: true});
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Bloquea el scroll del fondo mientras el menú móvil está abierto
    useEffect(() =>
    {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    return (
        <header className={styles.header} data-scrolled={scrolled}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" aria-label="Forjas, inicio" className={styles.brand}>
                    <Logo priority />
                </Link>

                <nav aria-label="Principal" className={styles.nav}>
                    <NavList linkClass={styles.navLink} />
                </nav>

                <div className={styles.actions}>
                    <Link href="/shop#buscar" className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label="Buscar en la tienda">
                        <Search />
                    </Link>
                    <Link href="/account" className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label="Mi cuenta">
                        <User />
                    </Link>
                    <ThemeToggle />
                    <Link href="/cart" className={styles.cart}>
                        Carrito ({count})
                    </Link>
                    <button type="button" className={`${styles.iconBtn} ${styles.mobileOnly}`} onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
                        <Menu />
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Menú">
                    <div className={`container ${styles.inner}`}>
                        <Logo />
                        <button type="button" className={styles.iconBtn} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
                            <Close />
                        </button>
                    </div>
                    <nav aria-label="Móvil" className={`container ${styles.mobileNav}`}>
                        <NavList linkClass={styles.mobileLink} onNavigate={() => setMenuOpen(false)} />
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
