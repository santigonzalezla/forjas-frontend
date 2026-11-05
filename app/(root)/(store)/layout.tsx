import type {ReactNode} from 'react';
import {CartProvider} from '@/context/CartContext';
import Header from '@/app/components/layout/header/Header';
import Footer from '@/app/components/layout/footer/Footer';
import WhatsAppButton from '@/app/components/layout/whatsappbutton/WhatsAppButton';

export default function StoreLayout({children}: Readonly<{children: ReactNode}>)
{
    return (
        <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
        </CartProvider>
    );
}
