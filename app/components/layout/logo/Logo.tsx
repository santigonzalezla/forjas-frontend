import Image from 'next/image';
import styles from './logo.module.css';

interface LogoProps
{
    className?: string;
    priority?:  boolean;
    onDark?:    boolean; // siempre la versión blanca (secciones negras como el footer)
}

// Dos versiones del logo: a color para el tema claro y blanca para el oscuro.
// Se alternan con CSS para que no haya salto al cambiar de tema.
const Logo = ({className = '', priority = false, onDark = false}: LogoProps) =>
{
    if (onDark)
        return (
            <span className={`${styles.logo} ${className}`}>
                <Image src="/brand/logo-blanco.png" alt="Forjas · Hierro Hecho Arte" width={640} height={261} priority={priority} />
            </span>
        );

    return (
        <span className={`${styles.logo} ${className}`}>
            <Image src="/brand/logo-color.png"  alt="Forjas · Hierro Hecho Arte" width={640} height={261} priority={priority} className={styles.light} />
            <Image src="/brand/logo-blanco.png" alt="" aria-hidden width={640} height={261} priority={priority} className={styles.dark} />
        </span>
    );
};

export default Logo;
