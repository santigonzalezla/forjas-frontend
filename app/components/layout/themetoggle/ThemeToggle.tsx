'use client';

import styles from './themetoggle.module.css';
import {Moon, Sun} from '@/app/components/svg';
import {useTheme} from '@/context/ThemeContext';

const ThemeToggle = () =>
{
    const {theme, toggleTheme} = useTheme();
    const isDark               = theme === 'dark';

    return (
        <button
            type="button"
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {isDark ? <Sun /> : <Moon />}
        </button>
    );
};

export default ThemeToggle;
