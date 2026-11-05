import Link from 'next/link';
import styles from './consentcheck.module.css';

// Autorización de tratamiento de datos (Ley 1581 de 2012). Siempre explícita, nunca marcada por defecto.
const ConsentCheck = ({id = 'consent'}: {id?: string}) =>
{
    return (
        <label className={styles.consent} htmlFor={id}>
            <input id={id} name="consent" type="checkbox" value="true" required className={styles.box} />
            <span>
                Autorizo a Forjas a usar mis datos para responder esta solicitud, según la{' '}
                <Link href="/privacy" target="_blank" className={styles.link}>política de tratamiento de datos</Link>.
            </span>
        </label>
    );
};

export default ConsentCheck;
