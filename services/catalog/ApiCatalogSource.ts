import type {ICatalogSource} from '@/services/catalog/ICatalogSource';
import type {IHttpClient} from '@/services/http/IHttpClient';
import {HttpError} from '@/services/http/HttpError';
import type {CatalogFilters, CatalogPage, CategoryOption, FeaturedPiece, MediaImage, Product, ProductDetail} from '@/app/interfaces/interfaces';
import type {ApiCategory, ApiFeaturedPiece, ApiProduct, ApiProductImage} from '@/app/interfaces/admin';
import type {PaginatedResponse} from '@/app/interfaces/interfaces';
import {ProductCategory, ProductType} from '@/app/interfaces/enums';

// Adaptador: traduce las respuestas del backend Nest a los tipos de la tienda.
// Si el backend cambia su forma, solo se toca este archivo.

const CATEGORY_BY_SLUG: Record<string, ProductCategory> = {
    'muebles':         ProductCategory.FURNITURE,
    'iluminacion':     ProductCategory.LIGHTING,
    'decoracion':      ProductCategory.DECOR,
    'linea-reciclada': ProductCategory.RECYCLED,
    'ornamentacion':   ProductCategory.ORNAMENTAL,
    'restauracion':    ProductCategory.RESTORATION,
};

// Producto sin fotos: se muestra el logo como respaldo en lugar de romper la tarjeta
const FALLBACK_IMAGE: MediaImage = {src: '/brand/logo-color.png', alt: 'Forjas · Hierro Hecho Arte', width: 640, height: 261};

const toImage = (image: ApiProductImage): MediaImage => ({src: image.url, alt: image.alt, width: image.width, height: image.height});

const toProduct = (product: ApiProduct): Product => ({
    id:       product.id,
    slug:     product.slug,
    name:     product.name,
    detail:   product.summary,
    type:     product.type as ProductType,
    category: CATEGORY_BY_SLUG[product.category.slug] ?? ProductCategory.FURNITURE,
    price:    product.price,
    image:    product.images[0] ? toImage(product.images[0]) : FALLBACK_IMAGE,
});

const toProductDetail = (product: ApiProduct): ProductDetail => ({
    ...toProduct(product),
    description:    product.description,
    images:         product.images.length > 0 ? product.images.map(toImage) : [FALLBACK_IMAGE],
    categoryName:   product.category.name,
    categorySlug:   product.category.slug,
    compareAtPrice: product.compareAtPrice,
    leadTimeDays:   product.leadTimeDays,
    stock:          product.stock,
    model3dUrl:     product.model3dUrl,
});

const toFeaturedPiece = (piece: ApiFeaturedPiece): FeaturedPiece => ({
    id:       piece.id,
    name:     piece.name,
    image:    {src: piece.image.url, alt: piece.image.alt, width: piece.image.width, height: piece.image.height},
    products: [toProduct(piece.products[0]), toProduct(piece.products[1])],
});

export class ApiCatalogSource implements ICatalogSource
{
    constructor(private readonly http: IHttpClient) {}

    async getFeaturedPieces(): Promise<FeaturedPiece[]>
    {
        const pieces = await this.http.get<ApiFeaturedPiece[]>('featured-piece');
        return pieces.map(toFeaturedPiece);
    }

    async getHighlightedProducts(): Promise<Product[]>
    {
        const products = await this.http.get<ApiProduct[]>('product/highlighted');
        return products.map(toProduct);
    }

    async getCategories(): Promise<CategoryOption[]>
    {
        const categories = await this.http.get<ApiCategory[]>('category');
        return categories.map(({slug, name}) => ({slug, name}));
    }

    async listProducts(filters: CatalogFilters, limit: number): Promise<CatalogPage>
    {
        const query = new URLSearchParams({limit: String(limit), page: String(filters.page ?? 1)});
        if (filters.category) query.set('category', filters.category);
        if (filters.search)   query.set('search', filters.search);
        if (filters.sort)     query.set('sort', filters.sort);

        const result = await this.http.get<PaginatedResponse<ApiProduct>>(`product?${query.toString()}`);
        return {
            products: result.data.map(toProduct),
            total:    result.total,
            page:     result.page,
            pages:    Math.max(1, Math.ceil(result.total / result.limit)),
        };
    }

    async getProductBySlug(slug: string): Promise<ProductDetail | null>
    {
        try
        {
            return toProductDetail(await this.http.get<ApiProduct>(`product/${encodeURIComponent(slug)}`));
        }
        catch (error)
        {
            if (error instanceof HttpError && error.status === 404) return null;
            throw error;
        }
    }

    async getProductSlugs(): Promise<string[]>
    {
        const result = await this.http.get<PaginatedResponse<ApiProduct>>('product?limit=100');
        return result.data.map(product => product.slug);
    }
}
