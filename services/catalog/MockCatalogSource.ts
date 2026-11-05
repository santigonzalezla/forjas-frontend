import type {ICatalogSource} from '@/services/catalog/ICatalogSource';
import type {CatalogFilters, CatalogPage, CategoryOption, FeaturedPiece, Product, ProductDetail} from '@/app/interfaces/interfaces';
import {PRODUCT_CATEGORY_LABELS, ProductCategory} from '@/app/interfaces/enums';
import {MOCK_FEATURED_PIECES, MOCK_PRODUCTS, MOCK_SHOP_HIGHLIGHTS} from '@/services/mock/mockData';

// Datos locales: sirven para desarrollar sin backend (CATALOG_SOURCE=mock)
const ALL: Product[] = Object.values(MOCK_PRODUCTS);

const slugOf = (category: ProductCategory) => category.toLowerCase();

export class MockCatalogSource implements ICatalogSource
{
    async getFeaturedPieces(): Promise<FeaturedPiece[]>
    {
        return MOCK_FEATURED_PIECES;
    }

    async getHighlightedProducts(): Promise<Product[]>
    {
        return MOCK_SHOP_HIGHLIGHTS;
    }

    async getCategories(): Promise<CategoryOption[]>
    {
        return Object.values(ProductCategory).map(category => ({slug: slugOf(category), name: PRODUCT_CATEGORY_LABELS[category]}));
    }

    async listProducts(filters: CatalogFilters, limit: number): Promise<CatalogPage>
    {
        const term     = filters.search?.toLowerCase();
        const filtered = ALL.filter(p => (!filters.category || slugOf(p.category) === filters.category)
            && (!term || `${p.name} ${p.detail}`.toLowerCase().includes(term)));

        const page = filters.page ?? 1;
        return {products: filtered.slice((page - 1) * limit, page * limit), total: filtered.length, page, pages: Math.max(1, Math.ceil(filtered.length / limit))};
    }

    async getProductBySlug(slug: string): Promise<ProductDetail | null>
    {
        const product = ALL.find(p => p.slug === slug);
        if (!product) return null;
        return {
            ...product, description: null, images: [product.image], categoryName: PRODUCT_CATEGORY_LABELS[product.category],
            categorySlug: slugOf(product.category), compareAtPrice: null, leadTimeDays: null, stock: null, model3dUrl: null,
        };
    }

    async getProductSlugs(): Promise<string[]>
    {
        return ALL.map(p => p.slug);
    }
}
