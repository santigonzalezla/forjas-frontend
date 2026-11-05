'use client';

import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import styles from './addtocartbutton.module.css';
import type {Product} from '@/app/interfaces/interfaces';
import {Check, Plus} from '@/app/components/svg';
import {useCart} from '@/context/CartContext';

interface AddToCartButtonProps
{
    product: Product;
}

const AddToCartButton = ({product}: AddToCartButtonProps) =>
{
    const {addItem}          = useCart();
    const [added, setAdded]  = useState(false);
    const timer              = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const handleClick = () =>
    {
        addItem(product);
        setAdded(true);
        toast.success(`${product.name} quedó en tu carrito`);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1600);
    };

    return (
        <button
            type="button"
            className={styles.button}
            data-added={added}
            onClick={handleClick}
            aria-label={`Agregar ${product.name} al carrito`}
        >
            {added ? <Check /> : <Plus />}
        </button>
    );
};

export default AddToCartButton;
