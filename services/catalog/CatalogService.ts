import type {ICatalogSource} from '@/services/catalog/ICatalogSource';
import type {CatalogFilters, CatalogPage, CategoryOption, FeaturedPiece, Product, ProductDetail} from '@/app/interfaces/interfaces';

const HIGHLIGHT_LIMIT = 8;
const PAGE_SIZE       = 12;
const RELATED_LIMIT   = 4;
const NEIGHBOR_LIMIT  = 100;

export class CatalogService
{
    constructor(private readonly source: ICatalogSource) {}

    getFeaturedPieces(): Promise<FeaturedPiece[]>
    {
        return this.source.getFeaturedPieces();
    }

    async getHighlightedProducts(): Promise<Product[]>
    {
        const products = await this.source.getHighlightedProducts();
        return products.slice(0, HIGHLIGHT_LIMIT);
    }

    getCategories(): Promise<CategoryOption[]>
    {
        return this.source.getCategories();
    }

    listProducts(filters: CatalogFilters): Promise<CatalogPage>
    {
        return this.source.listProducts(filters, PAGE_SIZE);
    }

    getProductBySlug(slug: string): Promise<ProductDetail | null>
    {
        return this.source.getProductBySlug(slug);
    }

    getProductSlugs(): Promise<string[]>
    {
        return this.source.getProductSlugs();
    }

    async getRelated(product: ProductDetail): Promise<Product[]>
    {
        const {products} = await this.source.listProducts({category: product.categorySlug}, RELATED_LIMIT + 1);
        return products.filter(p => p.id !== product.id).slice(0, RELATED_LIMIT);
    }

    async getNeighbors(product: ProductDetail): Promise<{prev: Product | null; next: Product | null}>
    {
        const {products} = await this.source.listProducts({category: product.categorySlug}, NEIGHBOR_LIMIT);
        const index      = products.findIndex(p => p.id === product.id);
        if (index === -1) return {prev: null, next: null};
        return {prev: products[index - 1] ?? null, next: products[index + 1] ?? null};
    }
}
