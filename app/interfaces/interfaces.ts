import type {ProductCategory, ProductType} from '@/app/interfaces/enums';

// ─── Media ─────────────────────────────────────────────────────────────────────

export interface MediaImage
{
    src:    string;
    alt:    string;
    width:  number;
    height: number;
}

// ─── Producto ──────────────────────────────────────────────────────────────────

export interface Product
{
    id:       string;
    slug:     string;
    name:     string;
    detail:   string;
    type:     ProductType;
    category: ProductCategory;
    price:    number | null; // null cuando la pieza es a medida
    image:    MediaImage;
}

// Pieza del hero: una obra con los dos productos que se muestran en la columna
export interface FeaturedPiece
{
    id:       string;
    name:     string;
    image:    MediaImage;
    products: [Product, Product];
}

// Detalle completo para la página de producto
export interface ProductDetail extends Product
{
    description:    string | null;
    images:         MediaImage[];
    categoryName:   string;
    categorySlug:   string;
    compareAtPrice: number | null;
    leadTimeDays:   number | null;
    stock:          number | null;
    model3dUrl:     string | null;
}

export interface CategoryOption
{
    slug: string;
    name: string;
}

export type CatalogSort = 'recommended' | 'price-asc' | 'price-desc' | 'newest';

export interface CatalogFilters
{
    category?: string;
    search?:   string;
    sort?:     CatalogSort;
    page?:     number;
}

export interface CatalogPage
{
    products: Product[];
    total:    number;
    page:     number;
    pages:    number;
}

// ─── Contenido ─────────────────────────────────────────────────────────────────

export interface CraftStep
{
    id:    string;
    title: string;
    text:  string;
    image: MediaImage;
}

export interface Project
{
    id:      string;
    slug:    string;
    title:   string;
    type:    string;
    summary: string;
    image:   MediaImage;
}

export interface ProjectDetail extends Project
{
    description: string | null;
    location:    string | null;
    year:        number | null;
    gallery:     MediaImage[];
    before:      MediaImage | null;
    after:       MediaImage | null;
}

// Caso de restauración con fotos reales de antes y después
export interface Restoration
{
    id:          string;
    title:       string;
    description: string;
    before:      MediaImage;
    after:       MediaImage;
}

// ─── Respuestas del backend ────────────────────────────────────────────────────

export interface PaginatedResponse<T>
{
    data:  T[];
    total: number;
    page:  number;
    limit: number;
}
