import styles from './catalogskeleton.module.css';

const CatalogSkeleton = () =>
{
    return (
        <div className={`container ${styles.page}`} aria-busy="true" aria-label="Cargando la tienda">
            <div className={styles.title} />
            <div className={styles.lead} />
            <div className={styles.grid}>
                {Array.from({length: 6}, (_, i) => <div key={i} className={styles.card} />)}
            </div>
        </div>
    );
};

export default CatalogSkeleton;
