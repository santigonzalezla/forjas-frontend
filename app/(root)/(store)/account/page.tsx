import type {Metadata} from 'next';
import styles from './account.module.css';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {WhatsApp} from '@/app/components/svg';
import {buildWhatsAppLink} from '@/lib/whatsapp';

export const metadata: Metadata = {
    title:  'Mi cuenta',
    robots: {index: false},
};

export default function AccountPage()
{
    return (
        <section className={`container ${styles.page}`}>
            <h1 className={styles.title}>Mi cuenta</h1>
            <p className={styles.text}>
                Muy pronto podrás ver aquí tus pedidos, diseños guardados y cotizaciones. Por ahora no necesitas cuenta para comprar:
                el seguimiento lo hacemos contigo por WhatsApp.
            </p>
            <div className={styles.actions}>
                <ButtonLink href="/shop">Ir a la tienda</ButtonLink>
                <ButtonLink href={buildWhatsAppLink('Hola, quiero saber el estado de mi pedido.')} external icon={<WhatsApp />} variant="secondary">Consultar un pedido</ButtonLink>
            </div>
        </section>
    );
}
