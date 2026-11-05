// ─── Producto ──────────────────────────────────────────────────────────────────

export enum ProductType
{
    CATALOG      = 'CATALOG',      // precio fijo, se compra en el carrito
    CONFIGURABLE = 'CONFIGURABLE', // se diseña en el configurador 3D
    QUOTE        = 'QUOTE',        // a medida, se cotiza
}

export enum ProductCategory
{
    FURNITURE    = 'FURNITURE',
    LIGHTING     = 'LIGHTING',
    DECOR        = 'DECOR',
    RECYCLED     = 'RECYCLED',
    ORNAMENTAL   = 'ORNAMENTAL',
    RESTORATION  = 'RESTORATION',
}

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
    [ProductCategory.FURNITURE]:   'Muebles',
    [ProductCategory.LIGHTING]:    'Iluminación',
    [ProductCategory.DECOR]:       'Decoración',
    [ProductCategory.RECYCLED]:    'Línea reciclada',
    [ProductCategory.ORNAMENTAL]:  'Ornamentación',
    [ProductCategory.RESTORATION]: 'Restauración',
};
