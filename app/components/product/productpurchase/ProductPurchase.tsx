'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import styles from './productpurchase.module.css';
import QuantityStepper from '@/app/components/product/quantitystepper/QuantityStepper';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {WhatsApp} from '@/app/components/svg';
import {useCart} from '@/context/CartContext';
import {buildWhatsAppLink} from '@/lib/whatsapp';
import {findPiece, pieceForSlug} from '@/lib/configurator';
import {ProductType} from '@/app/interfaces/enums';
import type {ProductDetail} from '@/app/interfaces/interfaces';

// Acción principal según cómo se vende la pieza:
// catálogo → carrito · configurable → diseñador 3D · a medida → cotización
const ProductPurchase = ({product}: {product: ProductDetail}) =>
{
    const {addItem}             = useCart();
    const router                = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [added,    setAdded]    = useState(false);

    const whatsapp = buildWhatsAppLink(`Hola, me interesa "${product.name}". ¿Me pueden dar más información?`);

    if (product.type === ProductType.CONFIGURABLE)
        return (
            <div className={styles.actions}>
                <ButtonLink href={`/design?piece=${product.slug}`}>Diseñar en 3D</ButtonLink>
                <ButtonLink href={whatsapp} variant="secondary" external icon={<WhatsApp />}>Preguntar por WhatsApp</ButtonLink>
                <p className={styles.note}>Elige medidas, ornamentos y acabado, y mira el precio estimado antes de pedir la visita.</p>
            </div>
        );

    if (product.type === ProductType.QUOTE || product.price === null)
        return (
            <div className={styles.actions}>
                <ButtonLink href={`/quote?piece=${product.slug}`}>Cotizar esta pieza</ButtonLink>
                <ButtonLink href={whatsapp} variant="secondary" external icon={<WhatsApp />}>Preguntar por WhatsApp</ButtonLink>
                <p className={styles.note}>Se fabrica a la medida de tu espacio. Te respondemos con la cotización.</p>
            </div>
        );

    const piece        = pieceForSlug(product.slug);
    const customizable = !!piece && findPiece(piece).family !== 'ornamental';

    const handleAdd = () =>
    {
        addItem(product, quantity);
        setAdded(true);
        toast.success(`${product.name} quedó en tu carrito`, {action: {label: 'Ver carrito', onClick: () => router.push('/cart')}});
        setTimeout(() => setAdded(false), 1800);
    };

    return (
        <div className={styles.actions}>
            <div className={styles.buyRow}>
                <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock ?? 20} label="Cantidad" />
                <button type="button" className={styles.add} data-added={added} onClick={handleAdd}>
                    {added ? 'Agregado al carrito' : 'Agregar al carrito'}
                </button>
            </div>
            <ButtonLink href={whatsapp} variant="secondary" external icon={<WhatsApp />}>Preguntar por WhatsApp</ButtonLink>
            {/* Piezas de catálogo que también están en el configurador: se pueden pedir con otro tamaño o color */}
            {customizable && (
                <Link href={`/design?piece=${product.slug}`} className={styles.customize}>
                    Personalízala en 3D: elige tamaño, colores y acabado
                </Link>
            )}
        </div>
    );
};

export default ProductPurchase;
