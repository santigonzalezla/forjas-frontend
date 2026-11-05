import Link from 'next/link';
import styles from './footer.module.css';
import Logo from '@/app/components/layout/logo/Logo';
import {ADDRESS, CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_DISPLAY} from '@/lib/constants';
import {buildWhatsAppLink} from '@/lib/whatsapp';

const COLUMNS = [
    {
        title: 'Tienda',
        links: [
            {href: '/shop',                    label: 'Toda la tienda'},
            {href: '/shop?category=muebles',  label: 'Muebles'},
            {href: '/shop?category=iluminacion', label: 'Iluminación'},
            {href: '/shop?category=linea-reciclada', label: 'Línea reciclada'},
        ],
    },
    {
        title: 'Forjas',
        links: [
            {href: '/design',    label: 'Diseña en 3D'},
            {href: '/services', label: 'Servicios'},
            {href: '/projects', label: 'Proyectos'},
            {href: '/about',  label: 'Nosotros'},
        ],
    },
];

const Footer = () =>
{
    return (
        <footer className={`tone-ink ${styles.footer}`}>
            <div className={`container ${styles.grid}`}>
                <div className={styles.brand}>
                    <Logo onDark />
                    <p className={styles.tagline}>Hierro forjado a mano en Valledupar desde 1997.</p>
                </div>

                {COLUMNS.map(column => (
                    <nav key={column.title} aria-label={column.title} className={styles.column}>
                        <p className={styles.columnTitle}>{column.title}</p>
                        {column.links.map(link => (
                            <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>
                        ))}
                    </nav>
                ))}

                <address className={styles.column}>
                    <p className={styles.columnTitle}>Contacto</p>
                    <a href={buildWhatsAppLink('Hola, quiero más información sobre Forjas.')} className={styles.link} target="_blank" rel="noopener noreferrer">
                        WhatsApp {WHATSAPP_DISPLAY}
                    </a>
                    <a href={`mailto:${CONTACT_EMAIL}`} className={styles.link}>{CONTACT_EMAIL}</a>
                    <a href={INSTAGRAM_URL} className={styles.link} target="_blank" rel="noopener noreferrer">Instagram {INSTAGRAM_HANDLE}</a>
                    <span className={styles.muted}>{ADDRESS}</span>
                </address>
            </div>

            <div className={`container ${styles.bottom}`}>
                <p className={styles.muted}>Pagos con PSE, Nequi, Bancolombia y tarjetas, procesados por Wompi.</p>
                <nav aria-label="Legal" className={styles.legal}>
                    <Link href="/terms" className={styles.link}>Términos</Link>
                    <Link href="/privacy" className={styles.link}>Tratamiento de datos</Link>
                    <Link href="/returns" className={styles.link}>Cambios y garantías</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
