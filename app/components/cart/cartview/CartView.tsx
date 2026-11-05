'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useState, useSyncExternalStore} from 'react';
import styles from './cartview.module.css';
import QuantityStepper from '@/app/components/product/quantitystepper/QuantityStepper';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {Close, WhatsApp} from '@/app/components/svg';
import {useCart, type CartItem} from '@/context/CartContext';
import {formatCOP} from '@/lib/format';
import {buildWhatsAppLink} from '@/lib/whatsapp';
import {hydrationStore} from '@/lib/localStore';

const buildOrderMessage = (items: CartItem[], subtotal: number, note: string): string =>
{
    const lines = items.map(item => `• ${item.quantity} × ${item.name} — ${formatCOP(item.price * item.quantity)}`);
    return [
        'Hola, quiero hacer este pedido en Forjas:',
        '',
        ...lines,
        '',
        `Subtotal: ${formatCOP(subtotal)}`,
        ...(note.trim() ? ['', `Nota: ${note.trim()}`] : []),
        '',
        '¿Me confirman el envío y la forma de pago?',
    ].join('\n');
};

const CartView = () =>
{
    const {items, count, subtotal, removeItem, setQuantity} = useCart();
    const [note, setNote] = useState('');

    const hydrated = useSyncExternalStore(hydrationStore.subscribe, hydrationStore.getSnapshot, hydrationStore.getServerSnapshot);

    if (!hydrated) return <div className={`container ${styles.page}`} aria-busy="true" />;

    if (items.length === 0)
        return (
            <div className={`container ${styles.page} ${styles.empty}`}>
                <h1 className={styles.title}>Tu carrito está vacío</h1>
                <p className={styles.emptyText}>Explora las piezas del taller o diseña una a tu medida.</p>
                <div className={styles.emptyActions}>
                    <ButtonLink href="/shop">Ir a la tienda</ButtonLink>
                    <ButtonLink href="/design" variant="secondary">Diseñar en 3D</ButtonLink>
                </div>
            </div>
        );

    return (
        <div className={`container ${styles.page}`}>
            <h1 className={styles.title}>Tu carrito</h1>
            <p className={styles.count}>{count} {count === 1 ? 'pieza' : 'piezas'}</p>

            <div className={styles.layout}>
                <section aria-label="Piezas en el carrito">
                    <ul className={styles.list}>
                        {items.map(item => (
                            <li key={item.productId} className={styles.item}>
                                <Link href={`/shop/${item.slug}`} className={styles.thumb}>
                                    <Image src={item.imageSrc} alt="" fill sizes="120px" className={styles.thumbImage} />
                                </Link>
                                <div className={styles.itemInfo}>
                                    <Link href={`/shop/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                                    <p className={styles.itemPrice}>{formatCOP(item.price)} c/u</p>
                                    <QuantityStepper value={item.quantity} onChange={value => setQuantity(item.productId, value)} label={`Cantidad de ${item.name}`} />
                                </div>
                                <p className={styles.lineTotal}>{formatCOP(item.price * item.quantity)}</p>
                                <button type="button" className={styles.remove} onClick={() => removeItem(item.productId)} aria-label={`Quitar ${item.name}`}>
                                    <Close />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <label className={styles.noteField}>
                        <span className={styles.noteLabel}>¿Algo que el taller deba saber?</span>
                        <textarea
                            className={styles.note}
                            maxLength={500}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Medidas especiales, color, horario de entrega…"
                        />
                    </label>
                </section>

                <aside className={styles.summary} aria-label="Resumen">
                    <h2 className={styles.summaryTitle}>Resumen</h2>
                    <dl className={styles.rows}>
                        <div className={styles.row}><dt>Subtotal</dt><dd>{formatCOP(subtotal)}</dd></div>
                        <div className={styles.row}><dt>Envío</dt><dd className={styles.muted}>Se calcula según tu ciudad</dd></div>
                    </dl>
                    <div className={styles.total}><span>Total</span><span>{formatCOP(subtotal)}</span></div>

                    <button type="button" className={styles.checkout} disabled aria-describedby="pago-nota">Continuar al pago</button>
                    <p id="pago-nota" className={styles.checkoutNote}>El pago en línea (PSE, Nequi y tarjetas) estará disponible muy pronto. Mientras tanto, termina tu pedido por WhatsApp.</p>

                    <ButtonLink href={buildWhatsAppLink(buildOrderMessage(items, subtotal, note))} variant="inverse" external icon={<WhatsApp />}>
                        Pedir por WhatsApp
                    </ButtonLink>
                    <Link href="/shop" className={styles.continue}>Seguir viendo la tienda</Link>
                </aside>
            </div>
        </div>
    );
};

export default CartView;
