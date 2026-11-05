import type {CatalogFilters, CatalogPage, CategoryOption, FeaturedPiece, Product, ProductDetail} from '@/app/interfaces/interfaces';

// Origen de los datos del catálogo: backend Nest (ApiCatalogSource) o datos locales.
export interface ICatalogSource
{
    getFeaturedPieces(): Promise<FeaturedPiece[]>;
    getHighlightedProducts(): Promise<Product[]>;
    getCategories(): Promise<CategoryOption[]>;
    listProducts(filters: CatalogFilters, limit: number): Promise<CatalogPage>;
    getProductBySlug(slug: string): Promise<ProductDetail | null>;
    getProductSlugs(): Promise<string[]>;
}
