import Link from 'next/link';
import type {ReactNode} from 'react';
import styles from './buttonlink.module.css';

type Variant = 'primary' | 'secondary' | 'inverse';

interface ButtonLinkProps
{
    href:      string;
    children:  ReactNode;
    variant?:  Variant;
    external?: boolean;
    icon?:     ReactNode;
}

// Botón con forma de píldora para enlaces de acción. Un solo primario por pantalla.
const ButtonLink = ({href, children, variant = 'primary', external = false, icon}: ButtonLinkProps) =>
{
    const content = (
        <>
            {icon}
            <span>{children}</span>
        </>
    );

    if (external)
        return (
            <a href={href} className={styles.button} data-variant={variant} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        );

    return (
        <Link href={href} className={styles.button} data-variant={variant}>
            {content}
        </Link>
    );
};

export default ButtonLink;
