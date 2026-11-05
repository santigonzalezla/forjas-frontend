import RevealScope from '@/app/components/ui/revealscope/RevealScope';
import styles from './catalogview.module.css';
import ProductCard from '@/app/components/shop/productcard/ProductCard';
import CatalogToolbar from '@/app/components/shop/catalogtoolbar/CatalogToolbar';
import CategoryNav from '@/app/components/shop/categorynav/CategoryNav';
import Pagination from '@/app/components/shop/pagination/Pagination';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import PageNav from '@/app/components/ui/pagenav/PageNav';
import {getCategories, listProducts} from '@/services/queries/catalog';
import type {CatalogSort} from '@/app/interfaces/interfaces';

const SORTS: CatalogSort[] = ['recommended', 'price-asc', 'price-desc', 'newest'];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const CatalogView = async ({searchParams}: {searchParams: SearchParams}) =>
{
    const params   = await searchParams;
    const category = first(params.category);
    const search   = first(params.q)?.trim().slice(0, 80) || undefined;
    const sortRaw  = first(params.sort) as CatalogSort | undefined;
    const sort     = sortRaw && SORTS.includes(sortRaw) ? sortRaw : undefined;
    const page     = Math.max(1, Number(first(params.page)) || 1);

    const [catalog, categories] = await Promise.all([
        listProducts({category, search, sort, page}),
        getCategories(),
    ]);

    const current = categories.find(c => c.slug === category);

    return (
        <RevealScope>
        <div className={`container ${styles.page}`}>
            {current && <PageNav back={{href: '/shop', label: 'Tienda'}} crumbs={[{href: '/shop', label: 'Tienda'}, {label: current.name}]} />}
            {/* key: al cambiar de categoría el título se monta de nuevo (splitText ya
                partió el anterior en palabras y React no podría actualizar su texto) */}
            <header key={current?.slug ?? 'all'} className={styles.header}>
                <h1 className={styles.title} data-reveal-words>{current ? current.name : 'Tienda'}</h1>
                <p className={styles.lead} data-reveal>
                    {current
                        ? `Piezas de ${current.name.toLowerCase()} forjadas a mano en Valledupar.`
                        : 'Muebles, iluminación y decoración en hierro, forjados a mano en Valledupar. Enviamos a todo el país.'}
                </p>
            </header>

            <div className={styles.layout}>
                <CategoryNav categories={categories} active={category} />

                <section className={styles.results} aria-label="Productos">
                    <CatalogToolbar total={catalog.total} search={search ?? ''} sort={sort ?? 'recommended'} />

                    {catalog.products.length === 0
                        ? (
                            <div className={styles.empty}>
                                <p className={styles.emptyTitle}>No encontramos piezas con esa búsqueda.</p>
                                <p className={styles.emptyText}>Si buscas algo a medida, lo forjamos para ti.</p>
                                <ButtonLink href="/quote" variant="secondary">Cotizar una pieza</ButtonLink>
                            </div>
                        )
                        : (
                            <div className={styles.grid}>
                                {catalog.products.map(product => (
                                    <div key={product.id} data-reveal>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}

                    <Pagination page={catalog.page} pages={catalog.pages} />

                    <aside className={`tone-dark ${styles.custom}`} data-reveal>
                        <div>
                            <p className={styles.customTitle}>¿No está la medida que buscas?</p>
                            <p className={styles.customText}>Portones, rejas y barandas se diseñan para tu espacio. Pruébalo en 3D.</p>
                        </div>
                        <ButtonLink href="/design">Diseñar en 3D</ButtonLink>
                    </aside>
                </section>
            </div>
        </div>
        </RevealScope>
    );
};

export default CatalogView;
