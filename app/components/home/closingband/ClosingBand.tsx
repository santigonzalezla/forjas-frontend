import styles from './closingband.module.css';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {WhatsApp} from '@/app/components/svg';
import {buildWhatsAppLink} from '@/lib/whatsapp';

const ClosingBand = () =>
{
    return (
        <section className={`band tone-brand ${styles.section}`} aria-labelledby="cierre-titulo">
            <div className={`container ${styles.inner}`}>
                <h2 id="cierre-titulo" className={styles.title} data-reveal-words>¿Tienes un espacio esperando una pieza?</h2>
                <div className={styles.actions} data-reveal>
                    <ButtonLink
                        href={buildWhatsAppLink('Hola, tengo un proyecto y quiero asesoría.')}
                        external
                        icon={<WhatsApp />}
                    >
                        Escríbenos por WhatsApp
                    </ButtonLink>
                    <ButtonLink href="/quote" variant="secondary">Agendar visita técnica</ButtonLink>
                </div>
            </div>
        </section>
    );
};

export default ClosingBand;
