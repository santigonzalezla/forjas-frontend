import {cacheLife, cacheTag} from 'next/cache';
import {catalogService} from '@/services/container';
import type {CatalogFilters, CatalogPage, CategoryOption, FeaturedPiece, Product, ProductDetail} from '@/app/interfaces/interfaces';

// Lecturas cacheadas. 'use cache' no admite métodos de clase, por eso la caché vive
// aquí y la lógica en los servicios. El backend invalida con revalidateTag('products').

export async function getFeaturedPieces(): Promise<FeaturedPiece[]>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');

    return catalogService.getFeaturedPieces();
}

export async function getHighlightedProducts(): Promise<Product[]>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');

    return catalogService.getHighlightedProducts();
}

export async function getCategories(): Promise<CategoryOption[]>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');

    return catalogService.getCategories();
}

// Los filtros son argumentos: cada combinación queda en su propia entrada de caché
export async function listProducts(filters: CatalogFilters): Promise<CatalogPage>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');

    return catalogService.listProducts(filters);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');

    return catalogService.getProductBySlug(slug);
}

export async function getRelatedProducts(product: ProductDetail): Promise<Product[]>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');

    return catalogService.getRelated(product);
}

export async function getProductSlugs(): Promise<string[]>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');

    return catalogService.getProductSlugs();
}

export async function getProductNeighbors(product: ProductDetail): Promise<{prev: Product | null; next: Product | null}>
{
    'use cache';
    cacheLife('hours');
    cacheTag('products');
    return catalogService.getNeighbors(product);
}
