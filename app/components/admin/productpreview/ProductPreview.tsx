import Image from 'next/image';
import styles from './productpreview.module.css';
import {ImageIcon} from '@/app/components/svg';
import {formatCOP} from '@/lib/format';
import type {ApiProductImage} from '@/app/interfaces/admin';

interface ProductPreviewProps
{
    name:    string;
    summary: string;
    price:   number | null;
    image?:  ApiProductImage;
}

const ProductPreview = ({name, summary, price, image}: ProductPreviewProps) =>
{
    return (
        <div className={styles.preview}>
            <div className={styles.media}>
                {image
                    ? <Image src={image.url} alt="" fill sizes="300px" className={styles.image} />
                    : <span className={styles.empty}><ImageIcon />Sube una foto para verla aquí</span>}
            </div>
            <p className={styles.name}>{name}</p>
            <p className={styles.summary}>{summary}</p>
            <p className={styles.price}>{price === null ? 'A medida' : formatCOP(price)}</p>
        </div>
    );
};

export default ProductPreview;
