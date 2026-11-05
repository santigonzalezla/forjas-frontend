import type {CatalogFilters, CatalogPage, CategoryOption, FeaturedPiece, Product, ProductDetail} from '@/app/interfaces/interfaces';

export interface ICatalogSource
{
    getFeaturedPieces(): Promise<FeaturedPiece[]>;
    getHighlightedProducts(): Promise<Product[]>;
    getCategories(): Promise<CategoryOption[]>;
    listProducts(filters: CatalogFilters, limit: number): Promise<CatalogPage>;
    getProductBySlug(slug: string): Promise<ProductDetail | null>;
    getProductSlugs(): Promise<string[]>;
}
