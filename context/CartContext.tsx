'use client';

import {createContext, useCallback, useContext, useSyncExternalStore, type ReactNode} from 'react';
import type {Product} from '@/app/interfaces/interfaces';
import {createLocalStore} from '@/lib/localStore';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem
{
    productId: string;
    slug:      string;
    name:      string;
    price:     number;
    imageSrc:  string;
    quantity:  number;
}

interface CartContextType
{
    items:      CartItem[];
    count:      number;
    subtotal:   number;
    addItem:    (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    setQuantity: (productId: string, quantity: number) => void;
    clear:      () => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

const EMPTY: CartItem[] = [];
const cartStore         = createLocalStore<CartItem[]>('fj_cart', EMPTY);

const CartContext = createContext<CartContextType | null>(null);

// El carrito vive en el navegador para permitir compra como invitado. Los precios
// que guarda son solo para mostrar: el backend recalcula el total al crear el pedido.
export function CartProvider({children}: {children: ReactNode})
{
    const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);

    const addItem = useCallback((product: Product, quantity = 1) =>
    {
        // Las piezas a medida no tienen precio: se cotizan, no van al carrito
        if (product.price === null) return;

        const current  = cartStore.getSnapshot();
        const existing = current.find(item => item.productId === product.id);

        cartStore.set(existing
            ? current.map(item => item.productId === product.id
                ? {...item, quantity: item.quantity + quantity}
                : item)
            : [...current, {
                productId: product.id,
                slug:      product.slug,
                name:      product.name,
                price:     product.price,
                imageSrc:  product.image.src,
                quantity,
            }]);
    }, []);

    const removeItem = useCallback((productId: string) =>
    {
        cartStore.set(cartStore.getSnapshot().filter(item => item.productId !== productId));
    }, []);

    // Cantidad entre 1 y 20 por pieza (son piezas hechas a mano, no inventario masivo)
    const setQuantity = useCallback((productId: string, quantity: number) =>
    {
        const safe = Math.min(20, Math.max(1, Math.round(quantity)));
        cartStore.set(cartStore.getSnapshot().map(item => item.productId === productId ? {...item, quantity: safe} : item));
    }, []);

    const clear = useCallback(() => cartStore.clear(), []);

    const count    = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{items, count, subtotal, addItem, removeItem, setQuantity, clear}}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart(): CartContextType
{
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
