'use client';

import {useRouter} from 'next/navigation';
import styles from './admintopbar.module.css';
import ThemeToggle from '@/app/components/layout/themetoggle/ThemeToggle';
import {Logout, Menu} from '@/app/components/svg';
import {useAuth} from '@/context/AuthContext';
import {USER_ROLE_LABELS} from '@/app/interfaces/admin';

const AdminTopbar = ({onMenu}: {onMenu: () => void}) =>
{
    const {user, logout} = useAuth();
    const router         = useRouter();

    const handleLogout = async () =>
    {
        await logout();
        router.replace('/admin/login');
    };

    return (
        <header className={styles.topbar}>
            <button type="button" className={styles.menu} onClick={onMenu} aria-label="Abrir menú">
                <Menu />
            </button>

            <div className={styles.right}>
                <ThemeToggle />
                {user && (
                    <div className={styles.user}>
                        <span className={styles.avatar} aria-hidden>{user.firstName.charAt(0)}</span>
                        <span className={styles.userText}>
                            <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                            <span className={styles.userRole}>{USER_ROLE_LABELS[user.role]}</span>
                        </span>
                    </div>
                )}
                <button type="button" className={styles.logout} onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
                    <Logout />
                </button>
            </div>
        </header>
    );
};

export default AdminTopbar;
