'use client';

import {createContext, useCallback, useContext, useSyncExternalStore, type ReactNode} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType
{
    theme:       Theme;
    toggleTheme: () => void;
}

const STORAGE_KEY = 'theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Script que corre en <head> antes del primer pintado: aplica el tema guardado o el
// del sistema. Evita el parpadeo que tendría leer localStorage después de hidratar.
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('${STORAGE_KEY}');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t)}catch(e){}})()`;

// El atributo data-theme de <html> es la única fuente de verdad del tema
const subscribe = (listener: () => void) =>
{
    const observer = new MutationObserver(listener);
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    return () => observer.disconnect();
};

const getSnapshot       = (): Theme => document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
const getServerSnapshot = (): Theme => 'light';

export function ThemeProvider({children}: {children: ReactNode})
{
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const toggleTheme = useCallback(() =>
    {
        const next: Theme = getSnapshot() === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);

        try
        {
            localStorage.setItem(STORAGE_KEY, next);
        }
        catch
        {
            // Modo privado o almacenamiento bloqueado: el tema dura solo la sesión
        }
    }, []);

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType
{
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}
