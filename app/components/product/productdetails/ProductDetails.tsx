import styles from './productdetails.module.css';
import {ProductType} from '@/app/interfaces/enums';
import type {ProductDetail} from '@/app/interfaces/interfaces';

// Información secundaria en acordeón nativo (<details>): accesible y sin JavaScript
const ProductDetails = ({product}: {product: ProductDetail}) =>
{
    const madeToOrder = product.stock === null || product.stock === 0;

    return (
        <div className={styles.details}>
            <details className={styles.item} open>
                <summary className={styles.summary}>Fabricación</summary>
                <div className={styles.content}>
                    <p>Pieza hecha a mano en nuestro taller de Valledupar.</p>
                    {product.type === ProductType.CATALOG && (
                        <p>
                            {madeToOrder
                                ? (product.leadTimeDays ? `Se fabrica a pedido: lista en unos ${product.leadTimeDays} días hábiles.` : 'Se fabrica a pedido; te confirmamos el tiempo de entrega al comprar.')
                                : `Disponible para entrega: ${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'}.`}
                        </p>
                    )}
                </div>
            </details>

            <details className={styles.item}>
                <summary className={styles.summary}>Envío e instalación</summary>
                <div className={styles.content}>
                    <p>Enviamos a todo el país. En Valledupar y alrededores también podemos instalar.</p>
                    <p>El costo del envío depende de la ciudad y del tamaño de la pieza; te lo confirmamos antes de pagar.</p>
                </div>
            </details>

            <details className={styles.item}>
                <summary className={styles.summary}>Cuidados del hierro</summary>
                <div className={styles.content}>
                    <p>Limpia con un paño seco o apenas húmedo y evita productos abrasivos.</p>
                    <p>En exteriores, revisa la pintura de vez en cuando y retoca los golpes para evitar el óxido.</p>
                </div>
            </details>
        </div>
    );
};

export default ProductDetails;
