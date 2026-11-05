import Image from 'next/image';
import Link from 'next/link';
import styles from './productcard.module.css';
import type {Product} from '@/app/interfaces/interfaces';
import AddToCartButton from '@/app/components/shop/addtocartbutton/AddToCartButton';
import {formatCOP} from '@/lib/format';

interface ProductCardProps
{
    product: Product;
}

const ProductCard = ({product}: ProductCardProps) =>
{
    const isCustom = product.price === null;

    return (
        <article className={styles.card}>
            <Link href={`/shop/${product.slug}`} className={styles.media}>
                <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                    className={styles.image}
                />
            </Link>
            <div className={styles.meta}>
                <div className={styles.text}>
                    <h3 className={styles.name}>
                        <Link href={`/shop/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className={styles.detail}>{product.detail}</p>
                    <p className={styles.price}>{isCustom ? 'A medida' : formatCOP(product.price as number)}</p>
                </div>
                {!isCustom && <AddToCartButton product={product} />}
            </div>
        </article>
    );
};

export default ProductCard;
