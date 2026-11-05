
export enum UserRole
{
    ADMIN    = 'ADMIN',
    EDITOR   = 'EDITOR',
    CUSTOMER = 'CUSTOMER',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]:    'Administrador',
    [UserRole.EDITOR]:   'Editor',
    [UserRole.CUSTOMER]: 'Cliente',
};

export enum ProductStatus
{
    DRAFT     = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED  = 'ARCHIVED',
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
    [ProductStatus.DRAFT]:     'Borrador',
    [ProductStatus.PUBLISHED]: 'Publicado',
    [ProductStatus.ARCHIVED]:  'Archivado',
};

export type ApiProductType = 'CATALOG' | 'CONFIGURABLE' | 'QUOTE';

export const PRODUCT_TYPE_LABELS: Record<ApiProductType, string> = {
    CATALOG:      'Catálogo',
    CONFIGURABLE: 'Configurable en 3D',
    QUOTE:        'A medida (cotización)',
};

export interface SessionUser
{
    id:        string;
    email:     string;
    firstName: string;
    lastName:  string;
    role:      UserRole;
}

export interface ApiCategory
{
    id:          string;
    name:        string;
    slug:        string;
    description: string | null;
    sortOrder:   number;
    isActive:    boolean;
    _count?:     {products: number};
}

export interface ApiProductImage
{
    id:        string;
    url:       string;
    alt:       string;
    width:     number;
    height:    number;
    sortOrder: number;
}

export interface ApiProduct
{
    id:             string;
    numId:          number;
    slug:           string;
    name:           string;
    summary:        string;
    description:    string | null;
    type:           ApiProductType;
    status:         ProductStatus;
    price:          number | null;
    compareAtPrice: number | null;
    currency:       string;
    stock:          number | null;
    leadTimeDays:   number | null;
    isHighlighted:  boolean;
    sortOrder:      number;
    model3dUrl:     string | null;
    category:       {id: string; name: string; slug: string};
    images:         ApiProductImage[];
    deletedAt:      string | null;
    createdAt:      string;
    updatedAt:      string;
}

export interface ApiFeaturedPiece
{
    id:        string;
    name:      string;
    isActive:  boolean;
    sortOrder: number;
    image:     {url: string; alt: string; width: number; height: number};
    products:  [ApiProduct, ApiProduct];
}

export interface InternalUser
{
    id:          string;
    email:       string;
    firstName:   string;
    lastName:    string;
    phone:       string | null;
    role:        UserRole;
    isActive:    boolean;
    lastLoginAt: string | null;
    createdAt:   string;
}

export interface DashboardSummary
{
    products:       {published: number; draft: number; archived: number; trash: number; withoutImages: number};
    categories:     number;
    featuredPieces: number;
    team:           number;
    projects:       number;
    newQuotes:      number;
}

export type ProjectImageRole = 'GALLERY' | 'BEFORE' | 'AFTER';

export const PROJECT_IMAGE_ROLE_LABELS: Record<ProjectImageRole, string> = {
    GALLERY: 'Galería',
    BEFORE:  'Antes',
    AFTER:   'Después',
};

export interface ApiProjectImage
{
    id: string; role: ProjectImageRole; url: string; alt: string; width: number; height: number; sortOrder: number;
}

export interface ApiProject
{
    id:          string;
    numId:       number;
    title:       string;
    slug:        string;
    type:        string;
    summary:     string;
    description: string | null;
    location:    string | null;
    year:        number | null;
    isFeatured:  boolean;
    isPublished: boolean;
    sortOrder:   number;
    images:      ApiProjectImage[];
    updatedAt:   string;
}

export type QuoteKind   = 'CONTACT' | 'QUOTE' | 'DESIGN';
export type QuoteStatus = 'NEW' | 'IN_PROGRESS' | 'QUOTED' | 'WON' | 'LOST' | 'ARCHIVED';

export const QUOTE_KIND_LABELS: Record<QuoteKind, string> = {
    CONTACT: 'Contacto',
    QUOTE:   'Cotización',
    DESIGN:  'Diseño 3D',
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
    NEW:         'Nueva',
    IN_PROGRESS: 'En gestión',
    QUOTED:      'Cotizada',
    WON:         'Ganada',
    LOST:        'Perdida',
    ARCHIVED:    'Archivada',
};

export const QUOTE_STATUS_TONE: Record<QuoteStatus, 'success' | 'neutral' | 'warning' | 'muted' | 'danger'> = {
    NEW:         'neutral',
    IN_PROGRESS: 'warning',
    QUOTED:      'warning',
    WON:         'success',
    LOST:        'danger',
    ARCHIVED:    'muted',
};

export interface ApiQuote
{
    id:            string;
    numId:         number;
    kind:          QuoteKind;
    status:        QuoteStatus;
    name:          string;
    phone:         string;
    email:         string | null;
    city:          string | null;
    projectType:   string | null;
    message:       string | null;
    widthCm:       number | null;
    heightCm:      number | null;
    productSlug:   string | null;
    design:        Record<string, unknown> | null;
    estimateMin:   number | null;
    estimateMax:   number | null;
    preferredDate: string | null;
    adminNotes:    string | null;
    attachments:   {id: string; url: string; width: number; height: number}[];
    createdAt:     string;
}

export interface ApiPricing
{
    isSample:  boolean;
    spread:    number;
    types:     Record<'gate' | 'window' | 'railing' | 'door', {rate: number; minPrice: number; measure: 'area' | 'length'}>;
    pieces:    Record<'nest' | 'stool' | 'armchair' | 'chandelier' | 'lantern' | 'bicycle' | 'tiered', Partial<Record<'small' | 'medium' | 'large', number>>>;
    styles:    Record<'minimal' | 'modern' | 'colonial' | 'baroque' | 'laser', number>;
    ornaments: Record<'scrolls' | 'hearts' | 'rings' | 'twisted' | 'collars' | 'spears' | 'balls' | 'plate' | 'rosette' | 'arch', {percent: number; flat: number}>;
    finishes:  Record<'negro' | 'oxido' | 'envejecido' | 'inox' | 'pintado', number>;
    patterns:  Record<'solid' | 'stripes' | 'art', number>;
    extras:    Record<'motor' | 'lock', number>;
}
