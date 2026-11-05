'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './producttable.module.css';
import StatusBadge from '@/app/components/ui/statusbadge/StatusBadge';
import {Edit, ImageIcon, Restore, Trash} from '@/app/components/svg';
import {formatCOP} from '@/lib/format';
import {PRODUCT_STATUS_LABELS, PRODUCT_TYPE_LABELS, ProductStatus, type ApiProduct} from '@/app/interfaces/admin';

interface ProductTableProps
{
    products:  ApiProduct[];
    isLoading: boolean;
    inTrash:   boolean;
    canDelete: boolean;
    onTrash:   (product: ApiProduct) => void;
    onRestore: (product: ApiProduct) => void;
}

const STATUS_TONE = {
    [ProductStatus.PUBLISHED]: 'success',
    [ProductStatus.DRAFT]:     'warning',
    [ProductStatus.ARCHIVED]:  'muted',
} as const;

const ProductTable = ({products, isLoading, inTrash, canDelete, onTrash, onRestore}: ProductTableProps) =>
{
    if (isLoading && products.length === 0) return <p className={styles.empty}>Cargando productos…</p>;
    if (products.length === 0) return <p className={styles.empty}>{inTrash ? 'La papelera está vacía.' : 'No hay productos con estos filtros.'}</p>;

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Tipo</th>
                        <th className={styles.right}>Precio</th>
                        <th>Estado</th>
                        <th aria-label="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {products.map(product =>
                    {
                        const cover = product.images[0];
                        return (
                            <tr key={product.id}>
                                <td>
                                    <Link href={`/admin/products/${product.id}`} className={styles.product}>
                                        <span className={styles.thumb}>
                                            {cover
                                                ? <Image src={cover.url} alt="" fill sizes="48px" className={styles.thumbImage} />
                                                : <ImageIcon className={styles.noImage} />}
                                        </span>
                                        <span>
                                            <span className={styles.name}>{product.name}</span>
                                            <span className={styles.summary}>{product.summary}</span>
                                        </span>
                                    </Link>
                                </td>
                                <td>{product.category.name}</td>
                                <td className={styles.muted}>{PRODUCT_TYPE_LABELS[product.type]}</td>
                                <td className={styles.right}>{product.price === null ? <span className={styles.muted}>A medida</span> : formatCOP(product.price)}</td>
                                <td><StatusBadge tone={STATUS_TONE[product.status]} label={PRODUCT_STATUS_LABELS[product.status]} /></td>
                                <td>
                                    <div className={styles.actions}>
                                        {inTrash
                                            ? canDelete && (
                                                <button type="button" className={styles.action} onClick={() => onRestore(product)} title="Restaurar" aria-label={`Restaurar ${product.name}`}>
                                                    <Restore />
                                                </button>
                                            )
                                            : (
                                                <>
                                                    <Link href={`/admin/products/${product.id}`} className={styles.action} title="Editar" aria-label={`Editar ${product.name}`}>
                                                        <Edit />
                                                    </Link>
                                                    {canDelete && (
                                                        <button type="button" className={styles.action} data-danger onClick={() => onTrash(product)} title="Enviar a la papelera" aria-label={`Enviar ${product.name} a la papelera`}>
                                                            <Trash />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
