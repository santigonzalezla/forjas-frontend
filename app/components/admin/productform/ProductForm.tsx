'use client';

import {useState, type FormEvent} from 'react';
import styles from './productform.module.css';
import Field, {Input, Select, Textarea} from '@/app/components/ui/field/Field';
import Toggle from '@/app/components/ui/toggle/Toggle';
import Button from '@/app/components/ui/button/Button';
import ProductPreview from '@/app/components/admin/productpreview/ProductPreview';
import {
    PRODUCT_STATUS_LABELS,
    PRODUCT_TYPE_LABELS,
    ProductStatus,
    type ApiCategory,
    type ApiProduct,
    type ApiProductType,
} from '@/app/interfaces/admin';

export interface ProductFormValues
{
    categoryId:    string;
    name:          string;
    summary:       string;
    description:   string;
    type:          ApiProductType;
    status:        ProductStatus;
    price:         string; // texto en el formulario; se convierte al enviar
    stock:         string;
    leadTimeDays:  string;
    isHighlighted: boolean;
}

interface ProductFormProps
{
    initial?:    ApiProduct;
    categories:  ApiCategory[];
    canSetPrice: boolean;
    saving:      boolean;
    onSubmit:    (payload: Record<string, unknown>) => void;
}

const toForm = (product?: ApiProduct): ProductFormValues => ({
    categoryId:    product?.category.id ?? '',
    name:          product?.name ?? '',
    summary:       product?.summary ?? '',
    description:   product?.description ?? '',
    type:          product?.type ?? 'CATALOG',
    status:        product?.status ?? ProductStatus.DRAFT,
    price:         product?.price?.toString() ?? '',
    stock:         product?.stock?.toString() ?? '',
    leadTimeDays:  product?.leadTimeDays?.toString() ?? '',
    isHighlighted: product?.isHighlighted ?? false,
});

const toNumberOrNull = (value: string): number | null => (value.trim() === '' ? null : Number(value.replace(/\D/g, '')));

// Formulario único para crear y editar. Los precios solo se envían si el usuario
// es ADMIN (el backend también lo valida y responde 403 a un EDITOR).
const ProductForm = ({initial, categories, canSetPrice, saving, onSubmit}: ProductFormProps) =>
{
    const [values, setValues] = useState<ProductFormValues>(() => toForm(initial));

    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
        setValues(previous => ({...previous, [key]: value}));

    const isQuote       = values.type === 'QUOTE';
    const needsPrice    = values.type === 'CATALOG' && values.status === ProductStatus.PUBLISHED && values.price.trim() === '';
    const categoryName  = categories.find(c => c.id === values.categoryId)?.name ?? 'Categoría';

    const handleSubmit = (e: FormEvent) =>
    {
        e.preventDefault();

        const payload: Record<string, unknown> = {
            categoryId:    values.categoryId,
            name:          values.name.trim(),
            summary:       values.summary.trim(),
            description:   values.description.trim() || undefined,
            type:          values.type,
            status:        values.status,
            stock:         toNumberOrNull(values.stock),
            leadTimeDays:  toNumberOrNull(values.leadTimeDays),
            isHighlighted: values.isHighlighted,
        };

        if (canSetPrice && !isQuote) payload.price = toNumberOrNull(values.price);

        onSubmit(payload);
    };

    return (
        <form className={styles.layout} onSubmit={handleSubmit}>
            <div className={styles.main}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Información</h2>
                    <Field label="Nombre" htmlFor="name">
                        <Input id="name" required minLength={2} maxLength={120} value={values.name} onChange={e => set('name', e.target.value)} placeholder="Mesa de terraza Colonial" />
                    </Field>
                    <Field label="Detalle corto" htmlFor="summary" hint="Aparece debajo del nombre en la tarjeta: material, medida o acabado.">
                        <Input id="summary" required maxLength={160} value={values.summary} onChange={e => set('summary', e.target.value)} placeholder="Hierro forjado y madera" />
                    </Field>
                    <Field label="Descripción" htmlFor="description" hint="Opcional. Se muestra en la página del producto.">
                        <Textarea id="description" maxLength={5000} value={values.description} onChange={e => set('description', e.target.value)} />
                    </Field>
                </section>

                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Venta</h2>
                    <div className={styles.row}>
                        <Field label="Categoría" htmlFor="categoryId">
                            <Select id="categoryId" required value={values.categoryId} onChange={e => set('categoryId', e.target.value)}>
                                <option value="" disabled>Elige una categoría</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </Field>
                        <Field label="Cómo se vende" htmlFor="type">
                            <Select id="type" value={values.type} onChange={e => set('type', e.target.value as ApiProductType)}>
                                {(Object.keys(PRODUCT_TYPE_LABELS) as ApiProductType[]).map(type => <option key={type} value={type}>{PRODUCT_TYPE_LABELS[type]}</option>)}
                            </Select>
                        </Field>
                    </div>

                    <div className={styles.row}>
                        <Field
                            label="Precio (COP)"
                            htmlFor="price"
                            hint={isQuote ? 'Las piezas a medida se cotizan: no llevan precio fijo.' : !canSetPrice ? 'Solo un administrador puede definir precios.' : 'Sin puntos ni signos. Ej: 1250000'}
                            error={needsPrice ? 'Para publicar un producto de catálogo necesitas un precio.' : null}
                        >
                            <Input
                                id="price"
                                inputMode="numeric"
                                value={isQuote ? '' : values.price}
                                onChange={e => set('price', e.target.value.replace(/\D/g, ''))}
                                disabled={isQuote || !canSetPrice}
                                placeholder={isQuote ? 'A medida' : '0'}
                            />
                        </Field>
                        <Field label="Unidades en stock" htmlFor="stock" hint="Vacío = se fabrica a pedido.">
                            <Input id="stock" inputMode="numeric" value={values.stock} onChange={e => set('stock', e.target.value.replace(/\D/g, ''))} />
                        </Field>
                        <Field label="Días de fabricación" htmlFor="leadTimeDays">
                            <Input id="leadTimeDays" inputMode="numeric" value={values.leadTimeDays} onChange={e => set('leadTimeDays', e.target.value.replace(/\D/g, ''))} placeholder="15" />
                        </Field>
                    </div>
                </section>
            </div>

            <aside className={styles.side}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Publicación</h2>
                    <Field label="Estado" htmlFor="status" hint={values.status === ProductStatus.PUBLISHED ? 'Visible en la tienda.' : 'No se ve en la tienda.'}>
                        <Select id="status" value={values.status} onChange={e => set('status', e.target.value as ProductStatus)}>
                            {Object.values(ProductStatus).map(status => <option key={status} value={status}>{PRODUCT_STATUS_LABELS[status]}</option>)}
                        </Select>
                    </Field>
                    <Toggle id="isHighlighted" label="Destacar en el inicio" hint="Aparece en la sección De la tienda." checked={values.isHighlighted} onChange={checked => set('isHighlighted', checked)} />
                    <Button type="submit" loading={saving} disabled={needsPrice || !values.categoryId || !values.name.trim() || !values.summary.trim()}>
                        {initial ? 'Guardar cambios' : 'Crear producto'}
                    </Button>
                </section>

                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Así se verá en la tienda</h2>
                    <ProductPreview
                        name={values.name || 'Nombre del producto'}
                        summary={values.summary || categoryName}
                        price={isQuote ? null : toNumberOrNull(values.price)}
                        image={initial?.images[0]}
                    />
                </section>
            </aside>
        </form>
    );
};

export default ProductForm;
