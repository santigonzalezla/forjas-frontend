import Link from 'next/link';
import styles from './shophighlights.module.css';
import SectionHeader from '@/app/components/ui/sectionheader/SectionHeader';
import ProductCard from '@/app/components/shop/productcard/ProductCard';
import Carousel from '@/app/components/ui/carousel/Carousel';
import {getHighlightedProducts} from '@/services/queries/catalog';

const CATEGORY_CHIPS = [
    {href: '/shop',                       label: 'Todo'},
    {href: '/shop?category=muebles',     label: 'Muebles'},
    {href: '/shop?category=iluminacion', label: 'Iluminación'},
    {href: '/shop?category=decoracion',  label: 'Decoración'},
    {href: '/shop?category=linea-reciclada',   label: 'Línea reciclada'},
];

const ShopHighlights = async () =>
{
    const products = await getHighlightedProducts();

    return (
        <section className={`section ${styles.section}`} aria-labelledby="tienda-titulo">
            <div className="container">
                <SectionHeader
                    id="tienda-titulo"
                    title="De la tienda"
                    description="Piezas hechas a mano en el taller, listas para tu casa."
                    action={{href: '/shop', label: 'Ver toda la tienda'}}
                />

                <nav className={styles.chips} aria-label="Categorías" data-reveal>
                    {CATEGORY_CHIPS.map((chip, i) => (
                        <Link key={chip.href} href={chip.href} className={styles.chip} data-active={i === 0}>{chip.label}</Link>
                    ))}
                </nav>

                <div data-reveal>
                    <Carousel label="Productos destacados">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </Carousel>
                </div>
            </div>
        </section>
    );
};

export default ShopHighlights;
