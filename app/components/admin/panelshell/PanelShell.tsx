'use client';

import {useState, type ReactNode} from 'react';
import styles from './panelshell.module.css';
import AdminGuard from '@/app/components/admin/adminguard/AdminGuard';
import AdminSidebar from '@/app/components/admin/adminsidebar/AdminSidebar';
import AdminTopbar from '@/app/components/admin/admintopbar/AdminTopbar';

// Estructura del panel (como el dashboard de LegalDocs): sidebar + topbar + contenido
const PanelShell = ({children}: {children: ReactNode}) =>
{
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <AdminGuard>
            <div className={styles.panel}>
                <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
                <div className={styles.main}>
                    <AdminTopbar onMenu={() => setMenuOpen(true)} />
                    <main className={styles.content}>{children}</main>
                </div>
            </div>
        </AdminGuard>
    );
};

export default PanelShell;
