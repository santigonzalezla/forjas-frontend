import Link from 'next/link';
import styles from './legaldocument.module.css';
import {LEGAL_UPDATED, type LegalDocumentContent} from '@/lib/content/legal';

const OTHER_DOCS = [
    {href: '/terms',   label: 'Términos y condiciones'},
    {href: '/privacy', label: 'Tratamiento de datos'},
    {href: '/returns', label: 'Cambios y garantías'},
];

// Documento legal: índice fijo a la izquierda y texto en columna de lectura
const LegalDocument = ({content, path}: {content: LegalDocumentContent; path: string}) =>
{
    return (
        <article className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>{content.title}</h1>
                <p className={styles.intro}>{content.intro}</p>
                <p className={styles.updated}>Última actualización: {LEGAL_UPDATED}</p>
            </header>

            <div className={styles.layout}>
                <aside className={styles.aside}>
                    <nav aria-label="En este documento">
                        <ol className={styles.toc}>
                            {content.sections.map(section => (
                                <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>
                            ))}
                        </ol>
                    </nav>
                    <nav aria-label="Otros documentos" className={styles.others}>
                        {OTHER_DOCS.filter(doc => doc.href !== path).map(doc => <Link key={doc.href} href={doc.href}>{doc.label}</Link>)}
                    </nav>
                </aside>

                <div className={styles.body}>
                    {content.sections.map(section => (
                        <section key={section.id} id={section.id} className={styles.section}>
                            <h2 className={styles.heading}>{section.heading}</h2>
                            {section.blocks.map((block, index) => typeof block === 'string'
                                ? <p key={index}>{block}</p>
                                : <ul key={index}>{block.list.map(item => <li key={item}>{item}</li>)}</ul>)}
                        </section>
                    ))}
                </div>
            </div>
        </article>
    );
};

export default LegalDocument;
