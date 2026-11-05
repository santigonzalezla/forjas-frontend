import styles from './whatsappbutton.module.css';
import {WhatsApp} from '@/app/components/svg';
import {buildWhatsAppLink} from '@/lib/whatsapp';

const WhatsAppButton = () =>
{
    return (
        <a
            href={buildWhatsAppLink('Hola, vengo de la página web de Forjas.')}
            className={styles.button}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
        >
            <WhatsApp />
        </a>
    );
};

export default WhatsAppButton;
