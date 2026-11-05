import type {Metadata, Viewport} from 'next';
import type {ReactNode} from 'react';
import {Toaster} from 'sonner';
import './globals.css';
import {APP_DESCRIPTION, APP_NAME, SERVER_URL} from '@/lib/constants';
import {fontVariables} from '@/app/fonts/fonts';
import {AuthProvider} from '@/context/AuthContext';
import {ThemeProvider, THEME_INIT_SCRIPT} from '@/context/ThemeContext';
import InlineScript from '@/app/components/ui/inlinescript/InlineScript';

export const metadata: Metadata = {
    title: {
        template: `%s | ${APP_NAME}`,
        default:  APP_NAME,
    },
    description:  APP_DESCRIPTION,
    metadataBase: new URL(SERVER_URL),
};

export const viewport: Viewport = {
    themeColor: [
        {media: '(prefers-color-scheme: light)', color: '#ffffff'},
        {media: '(prefers-color-scheme: dark)',  color: '#111315'},
    ],
};

export default function RootLayout({children}: Readonly<{children: ReactNode}>)
{
    return (
        <html lang="es-CO" data-theme="light" data-scroll-behavior="smooth" className={fontVariables} suppressHydrationWarning>
            <head>
                <InlineScript html={THEME_INIT_SCRIPT} />
            </head>
            <body>
                <Toaster richColors position="top-right" />
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
