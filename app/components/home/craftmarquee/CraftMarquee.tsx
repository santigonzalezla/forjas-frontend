import styles from './craftmarquee.module.css';

const CRAFTS = ['Portones', 'Rejas', 'Barandas', 'Muebles', 'Lámparas', 'Restauración', 'Acero inoxidable', 'Línea reciclada'];
const SPACES = ['Fachadas', 'Terrazas', 'Escaleras', 'Patios', 'Balcones', 'Negocios', 'Jardines', 'Salas'];

const Rosette = () => (
    <svg viewBox="-12 -12 24 24" className={styles.glyph} aria-hidden>
        <circle r="10" />
        <path d="M0 -10V10M-10 0H10" />
        <path d="M0 -3c-4-1-6 2-4 5M0 -3c4-1 6 2 4 5M0 3c-4 1-6-2-4-5M0 3c4 1 6-2 4-5" />
    </svg>
);

const Row = ({items, reverse = false, muted = false}: {items: string[]; reverse?: boolean; muted?: boolean}) =>
{
    const loop = [...items, ...items];

    return (
        <div className={styles.row} data-reverse={reverse} data-muted={muted} aria-hidden={muted}>
            <div className={styles.track}>
                {loop.map((item, i) => (
                    <span key={`${item}-${i}`} className={styles.item}>
                        {item}
                        <Rosette />
                    </span>
                ))}
            </div>
        </div>
    );
};

const CraftMarquee = () =>
{
    return (
        <section className={`band ${styles.band}`} aria-label="Lo que forjamos">
            <Row items={CRAFTS} />
            <Row items={SPACES} reverse muted />
        </section>
    );
};

export default CraftMarquee;
