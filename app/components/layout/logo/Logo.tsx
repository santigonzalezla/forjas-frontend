import Image from 'next/image';
import styles from './logo.module.css';

interface LogoProps
{
    className?: string;
    priority?:  boolean;
    onDark?:    boolean;
}

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
