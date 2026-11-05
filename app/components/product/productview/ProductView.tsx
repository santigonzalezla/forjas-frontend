import {notFound} from 'next/navigation';
import RevealScope from '@/app/components/ui/revealscope/RevealScope';
import styles from './productview.module.css';
import ProductGallery from '@/app/components/product/productgallery/ProductGallery';
import ProductPurchase from '@/app/components/product/productpurchase/ProductPurchase';
import ProductDetails from '@/app/components/product/productdetails/ProductDetails';
import ProductCard from '@/app/components/shop/productcard/ProductCard';
import Carousel from '@/app/components/ui/carousel/Carousel';
import PageNav from '@/app/components/ui/pagenav/PageNav';
import {getProductBySlug, getProductNeighbors, getRelatedProducts} from '@/services/queries/catalog';
import {formatCOP} from '@/lib/format';

const ProductView = async ({params}: {params: Promise<{slug: string}>}) =>
{
    const {slug}  = await params;
    const product = await getProductBySlug(slug);
    if (!product) notFound();

    const [related, {prev, next}] = await Promise.all([getRelatedProducts(product), getProductNeighbors(product)]);
    const categoryHref = `/shop?category=${product.categorySlug}`;

    return (
        <RevealScope>
        <article className={`container ${styles.page}`}>
            <PageNav
                back={{href: categoryHref, label: product.categoryName}}
                crumbs={[{href: '/shop', label: 'Tienda'}, {href: categoryHref, label: product.categoryName}, {label: product.name}]}
                prev={prev && {href: `/shop/${prev.slug}`, label: prev.name}}
                next={next && {href: `/shop/${next.slug}`, label: next.name}}
            />

            <div className={styles.layout}>
                <ProductGallery images={product.images} name={product.name} />

                <div className={styles.info}>
                    <h1 className={styles.name}>{product.name}</h1>
                    <p className={styles.detail}>{product.detail}</p>

                    <div className={styles.priceRow}>
                        {product.price === null
                            ? <p className={styles.price}>A medida</p>
                            : (
                                <>
                                    <p className={styles.price}>{formatCOP(product.price)}</p>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <p className={styles.compare}>{formatCOP(product.compareAtPrice)}</p>
                                    )}
                                </>
                            )}
                    </div>

                    {product.description && <p className={styles.description}>{product.description}</p>}

                    <ProductPurchase product={product} />

                    <ProductDetails product={product} />
                </div>
            </div>

            {related.length > 0 && (
                <section className={styles.related} aria-labelledby="relacionados">
                    <h2 id="relacionados" className={styles.relatedTitle} data-reveal-words>Combina con</h2>
                    <Carousel label="Productos relacionados">
                        {related.map(item => <ProductCard key={item.id} product={item} />)}
                    </Carousel>
                </section>
            )}
        </article>
        </RevealScope>
    );
};

export default ProductView;
