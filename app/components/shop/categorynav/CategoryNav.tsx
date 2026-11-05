import Link from 'next/link';
import styles from './categorynav.module.css';
import type {CategoryOption} from '@/app/interfaces/interfaces';

interface CategoryNavProps
{
    categories: CategoryOption[];
    active?:    string;
}

const CategoryNav = ({categories, active}: CategoryNavProps) =>
{
    return (
        <nav className={styles.nav} aria-label="Categorías">
            <p className={styles.heading}>Categorías</p>
            <ul className={styles.list}>
                <li>
                    <Link href="/shop" className={styles.link} data-active={!active} aria-current={!active ? 'page' : undefined}>Todo</Link>
                </li>
                {categories.map(category => (
                    <li key={category.slug}>
                        <Link
                            href={`/shop?category=${category.slug}`}
                            className={styles.link}
                            data-active={active === category.slug}
                            aria-current={active === category.slug ? 'page' : undefined}
                        >
                            {category.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default CategoryNav;
