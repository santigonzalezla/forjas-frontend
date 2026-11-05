import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './contact.module.css';
import ContactForm from '@/app/components/contact/contactform/ContactForm';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import RevealRoot from '@/app/components/ui/revealroot/RevealRoot';
import {WhatsApp} from '@/app/components/svg';
import {ADDRESS, CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL, PHONE_LANDLINE, WHATSAPP_DISPLAY} from '@/lib/constants';
import {buildWhatsAppLink} from '@/lib/whatsapp';

export const metadata: Metadata = {
    title:       'Contacto',
    description: `Escríbenos por WhatsApp al ${WHATSAPP_DISPLAY} o visítanos en ${ADDRESS}.`,
};

// Embed público de Google Maps (no requiere API key)
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=17&output=embed`;

export default function ContactPage()
{
    return (
        <>
            <div className={`container ${styles.page}`}>
                <section className={styles.formColumn}>
                    <h1 className={styles.title} data-reveal-words>Hablemos de tu pieza</h1>
                    <p className={styles.lead} data-reveal>Cuéntanos qué necesitas. Si ya tienes medidas o fotos, la <Link href="/quote" className={styles.inlineLink}>cotización</Link> nos ayuda a responderte más rápido.</p>
                    <div data-reveal><ContactForm /></div>
                </section>

                <aside className={styles.info} data-reveal>
                    <ButtonLink href={buildWhatsAppLink('Hola, quiero información sobre un trabajo en hierro.')} external icon={<WhatsApp />}>WhatsApp {WHATSAPP_DISPLAY}</ButtonLink>

                    <dl className={styles.list}>
                        <div><dt>Taller</dt><dd>{ADDRESS}</dd></div>
                        <div><dt>Teléfono fijo</dt><dd><a href={`tel:+57${PHONE_LANDLINE.replace(/\s/g, '')}`}>{PHONE_LANDLINE}</a></dd></div>
                        <div><dt>Correo</dt><dd><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></dd></div>
                        <div><dt>Instagram</dt><dd><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">{INSTAGRAM_HANDLE}</a></dd></div>
                    </dl>

                    <div className={styles.map}>
                        <iframe src={MAP_SRC} title={`Mapa: ${ADDRESS}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                </aside>
            </div>
            <RevealRoot />
        </>
    );
}
