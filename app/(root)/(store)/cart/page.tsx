import type {Metadata} from 'next';
import CartView from '@/app/components/cart/cartview/CartView';

export const metadata: Metadata = {
    title:  'Carrito',
    robots: {index: false, follow: true},
};

export default function CartPage()
{
    return <CartView />;
}
