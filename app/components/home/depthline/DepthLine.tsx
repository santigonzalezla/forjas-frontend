'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {animate, createScope, splitText, stagger} from 'animejs';
import styles from './depthline.module.css';
import type {FeaturedPiece, Product} from '@/app/interfaces/interfaces';
import {Plus} from '@/app/components/svg';
import {formatCOP, padNumber} from '@/lib/format';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {useCart} from '@/context/CartContext';

interface DepthLineProps
{
    pieces: FeaturedPiece[];
}

// ─── Tabla de profundidad (inspirada en Maison Vell) ─────────────────────────
// Una fila de piezas que se pierde en la distancia hacia la izquierda.
// Siete paradas, de d = -1 (saliendo por la derecha) a d = 5 (llegando desde la bruma).
// Valores en fracción del tamaño del escenario; se interpolan linealmente.
const KX = [1.24, .72, .50, .355, .25, .165, .10];  // centro horizontal
const KF = [1.10, .92, .84, .79, .755, .73, .71];   // línea del piso (borde inferior)
const KH = [.98, .70, .46, .34, .26, .20, .15];     // alto de la tarjeta
const KB = [6, 0, 1.5, 3.5, 7, 11, 16];             // desenfoque en px
const KO = [0, 1, 1, 1, .85, .5, 0];                // opacidad (la que sale se desvanece)

const CARD_RATIO   = 0.78;  // ancho/alto de las tarjetas de foto
const MOBILE_BREAK = 820;

const wrap  = (x: number, n: number) => ((x % n) + n) % n;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

const DepthLine = ({pieces}: DepthLineProps) =>
{
    const {addItem} = useCart();

    const stageRef    = useRef<HTMLDivElement>(null);
    const railRef     = useRef<HTMLDivElement>(null);
    const ringRef     = useRef<HTMLDivElement>(null);
    const numberRef   = useRef<HTMLSpanElement>(null);
    const nameRef     = useRef<HTMLSpanElement>(null);
    const headingRef  = useRef<HTMLHeadingElement>(null);
    const cardRefs    = useRef<(HTMLDivElement | null)[]>([]);
    const railCardRefs = useRef<(HTMLElement | null)[]>([]);

    const [active, setActive] = useState(0);

    const total    = pieces.length;
    const products = pieces.flatMap(piece => piece.products);

    // ─── Motor: una sola variable p controla escenario, riel y número ────────
    useEffect(() =>
    {
        const stage = stageRef.current;
        const rail  = railRef.current;
        const ring  = ringRef.current;
        if (!stage || !rail || !ring || total === 0) return;

        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

        let W = 0, H = 0, base = 0, cardS = 0, isMobile = false;
        let p = 0, target = 0, last = 0, dirty = true, frame = 0;
        let lastActive = -1;
        const cache = cardRefs.current.map(() => ({filter: '', opacity: ''}));

        const measure = () =>
        {
            W        = stage.clientWidth;
            H        = stage.clientHeight;
            base     = H * KH[0];
            isMobile = window.innerWidth <= MOBILE_BREAK;
            cardS    = isMobile ? 168 : rail.clientHeight / 3;

            // Las tarjetas se maquetan una vez a tamaño máximo; luego solo cambia transform
            cardRefs.current.forEach(card =>
            {
                if (!card) return;
                card.style.width  = `${base * CARD_RATIO}px`;
                card.style.height = `${base}px`;
            });

            railCardRefs.current.forEach(card =>
            {
                if (!card) return;
                card.style.height = isMobile ? '100%' : `${cardS}px`;
                card.style.width  = isMobile ? `${cardS}px` : '100%';
            });

            dirty = true;
        };

        const paint = () =>
        {
            cardRefs.current.forEach((card, i) =>
            {
                if (!card) return;

                let d = wrap(i - p, total);
                if (d > total - 1) d -= total;

                const k   = clamp(d + 1, 0, 6);
                const a   = Math.floor(k);
                const b   = Math.min(6, a + 1);
                const t   = k - a;
                const mix = (table: number[]) => table[a] + (table[b] - table[a]) * t;

                const h = mix(KH) * H;
                const s = h / base;
                const w = h * CARD_RATIO;
                const x = mix(KX) * W - w / 2;
                const y = mix(KF) * H - h;

                card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
                card.style.zIndex    = String(100 - Math.round(d * 10));

                // El blur se divide por la escala para que se vea igual a cualquier profundidad
                const blur    = mix(KB) / s;
                const filter  = blur < 0.2 ? 'none' : `blur(${blur.toFixed(1)}px)`;
                const opacity = mix(KO).toFixed(3);

                if (filter !== cache[i].filter)
                {
                    cache[i].filter    = filter;
                    card.style.filter  = filter;
                }
                if (opacity !== cache[i].opacity)
                {
                    cache[i].opacity   = opacity;
                    card.style.opacity = opacity;
                }
            });

            // Riel infinito: cada pieza aporta dos productos, la primera queda arriba
            const track = cardS * railCardRefs.current.length;
            railCardRefs.current.forEach((card, i) =>
            {
                if (!card) return;
                let offset = wrap(i * cardS - p * 2 * cardS, track);
                if (offset > track - cardS) offset -= track;
                card.style.transform = isMobile
                    ? `translate3d(${offset.toFixed(1)}px, 0, 0)`
                    : `translate3d(0, ${offset.toFixed(1)}px, 0)`;
            });

            // Número y nombre ruedan uno sobre otro
            const roll = wrap(p, total);
            [numberRef.current, nameRef.current].forEach(el =>
            {
                if (!el) return;
                const line = (el.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;
                el.style.transform = `translate3d(0, ${(-roll * line).toFixed(1)}px, 0)`;
            });

            const current = wrap(Math.round(p), total);
            if (current !== lastActive)
            {
                lastActive = current;
                setActive(current);
            }
        };

        // ─── Bucle ───────────────────────────────────────────────────────────
        let mx = 0, my = 0, cx = 0, cy = 0;

        const tick = (now: number) =>
        {
            const dt  = Math.min(50, now - last) || 16;
            last      = now;
            const was = p;

            if (reducedMotion) p = target;
            else               p += (target - p) * (1 - Math.exp(-dt * 0.0072));
            if (Math.abs(target - p) < 0.0004) p = target;

            if (p !== was || dirty)
            {
                dirty = false;
                paint();
            }

            cx += (mx - cx) * 0.32;
            cy += (my - cy) * 0.32;
            ring.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;

            frame = requestAnimationFrame(tick);
        };

        // ─── Interacción ─────────────────────────────────────────────────────
        let down = false, startX = 0, startTarget = 0, moved = 0;
        let wheelTimer: ReturnType<typeof setTimeout> | undefined;
        const pull = () => Math.max(150, W * 0.2);

        const onPointerEnter = (e: PointerEvent) =>
        {
            if (e.pointerType === 'mouse') ring.dataset.show = 'true';
        };
        const onPointerLeave = () => { ring.dataset.show = 'false'; };

        const onPointerMove = (e: PointerEvent) =>
        {
            const rect = stage.getBoundingClientRect();
            mx = e.clientX - rect.left;
            my = e.clientY - rect.top;
            if (!down) return;
            const dx = e.clientX - startX;
            moved    = Math.max(moved, Math.abs(dx));
            target   = startTarget + dx / pull();
        };

        const onPointerDown = (e: PointerEvent) =>
        {
            if ((e.target as HTMLElement).closest('a, button')) return;
            down        = true;
            startX      = e.clientX;
            startTarget = target;
            moved       = 0;
            stage.setPointerCapture(e.pointerId);
            ring.dataset.drag = 'true';
        };

        const release = (e: PointerEvent) =>
        {
            if (!down) return;
            down = false;
            ring.dataset.drag = 'false';

            if (moved < 6)
            {
                // Clic sobre una pieza del fondo: la trae al frente
                const hit = document.elementsFromPoint(e.clientX, e.clientY)
                    .find(el => (el as HTMLElement).dataset?.pieceIndex !== undefined) as HTMLElement | undefined;

                if (hit)
                {
                    const d = Math.round(wrap(Number(hit.dataset.pieceIndex) - target, total));
                    if (d > 0 && d < total) target = Math.round(target) + d;
                }
            }
            else target = Math.round(target);
        };

        const onWheel = (e: WheelEvent) =>
        {
            // Solo el desplazamiento horizontal mueve la fila; el vertical sigue bajando la página
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
            e.preventDefault();
            target += clamp(e.deltaX, -120, 120) / 420;
            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => { target = Math.round(target); }, 150);
        };

        const onKey = (e: KeyboardEvent) =>
        {
            if (e.key === 'ArrowRight') { e.preventDefault(); target = Math.round(target) + 1; }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); target = Math.round(target) - 1; }
        };

        measure();
        frame = requestAnimationFrame(tick);

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(stage);

        stage.addEventListener('pointerenter', onPointerEnter);
        stage.addEventListener('pointerleave', onPointerLeave);
        stage.addEventListener('pointermove', onPointerMove);
        stage.addEventListener('pointerdown', onPointerDown);
        stage.addEventListener('pointerup', release);
        stage.addEventListener('pointercancel', release);
        stage.addEventListener('wheel', onWheel, {passive: false});
        stage.addEventListener('keydown', onKey);

        return () =>
        {
            cancelAnimationFrame(frame);
            clearTimeout(wheelTimer);
            resizeObserver.disconnect();
            stage.removeEventListener('pointerenter', onPointerEnter);
            stage.removeEventListener('pointerleave', onPointerLeave);
            stage.removeEventListener('pointermove', onPointerMove);
            stage.removeEventListener('pointerdown', onPointerDown);
            stage.removeEventListener('pointerup', release);
            stage.removeEventListener('pointercancel', release);
            stage.removeEventListener('wheel', onWheel);
            stage.removeEventListener('keydown', onKey);
        };
    }, [total]);

    // ─── Entrada con anime.js: palabras del titular y piezas desde la bruma ──
    useEffect(() =>
    {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!stageRef.current || !headingRef.current) return;

        const scope = createScope({root: stageRef.current}).add(() =>
        {
            const {words} = splitText(headingRef.current as HTMLElement, {words: {wrap: 'clip'}});

            animate(words, {
                y:        ['100%', '0%'],
                duration: 900,
                delay:    stagger(70, {start: 150}),
                ease:     'out(4)',
            });

            animate(`.${styles.intro} p, .${styles.actions}, .${styles.tag}`, {
                opacity:  [0, 1],
                y:        [12, 0],
                duration: 700,
                delay:    stagger(120, {start: 500}),
                ease:     'out(3)',
            });

            animate(`.${styles.cardInner}`, {
                opacity:  [0, 1],
                y:        [24, 0],
                duration: 900,
                delay:    stagger(90, {from: 'last', start: 200}),
                ease:     'out(3)',
            });
        });

        return () => scope.revert();
    }, []);

    const activePiece = pieces[active];

    return (
        <section className={styles.hero} aria-label="Piezas destacadas">
            <div
                ref={stageRef}
                className={styles.stage}
                tabIndex={0}
                aria-label="Recorrido por las piezas del taller. Arrastra o usa las flechas para cambiar de pieza."
            >
                <div className={styles.line}>
                    {pieces.map((piece, i) => (
                        <div
                            key={piece.id}
                            ref={el => { cardRefs.current[i] = el; }}
                            className={styles.card}
                            data-piece-index={i}
                        >
                            <div className={styles.cardInner}>
                                <Image
                                    src={piece.image.src}
                                    alt={piece.image.alt}
                                    fill
                                    sizes="(max-width: 820px) 70vw, 40vw"
                                    priority={i < 2}
                                    className={styles.cardImage}
                                    draggable={false}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.intro}>
                    <h1 ref={headingRef} className={styles.heading}>Hierro hecho arte</h1>
                    <p className={styles.lead}>
                        Portones, rejas, barandas y muebles forjados a mano por la familia Losada Castro
                        en Valledupar desde 1997.
                    </p>
                    <div className={styles.actions}>
                        <ButtonLink href="/design">Diseña tu pieza en 3D</ButtonLink>
                        <ButtonLink href="/shop" variant="secondary">Ver la tienda</ButtonLink>
                    </div>
                </div>

                <div className={styles.tag}>
                    <div className={styles.rollRow} aria-live="polite">
                        <span className={styles.rollWindow}>
                            <span ref={numberRef} className={styles.roll}>
                                {[...pieces, pieces[0]].map((piece, i) => (
                                    <span key={`${piece.id}-${i}`} className={styles.rollNumber}>{padNumber((i % total) + 1)}</span>
                                ))}
                            </span>
                        </span>
                        <span className={styles.rollWindowName}>
                            <span ref={nameRef} className={styles.roll}>
                                {[...pieces, pieces[0]].map((piece, i) => (
                                    <span key={`${piece.id}-name-${i}`} className={styles.rollName}>{piece.name}</span>
                                ))}
                            </span>
                        </span>
                    </div>
                    {activePiece && (
                        <Link href={`/shop/${activePiece.products[0].slug}`} className={styles.pieceLink}>
                            Ver esta pieza
                        </Link>
                    )}
                </div>

                <p className={styles.hint}>Arrastra para recorrer el taller</p>
                <div ref={ringRef} className={styles.ring} aria-hidden />
            </div>

            <aside ref={railRef} className={styles.rail} aria-label="Productos de la pieza">
                {products.map((product, i) => (
                    <RailCard
                        key={`${product.id}-${i}`}
                        product={product}
                        alt={i % 2 === 1}
                        ref={el => { railCardRefs.current[i] = el; }}
                        onAdd={() => addItem(product)}
                    />
                ))}
            </aside>
        </section>
    );
};

// ─── Tarjeta del riel ──────────────────────────────────────────────────────

interface RailCardProps
{
    product: Product;
    alt:     boolean;
    ref:     (el: HTMLElement | null) => void;
    onAdd:   () => void;
}

const RailCard = ({product, alt, ref, onAdd}: RailCardProps) =>
{
    const isCustom = product.price === null;

    return (
        <article ref={ref} className={styles.railCard} data-alt={alt}>
            <Link href={`/shop/${product.slug}`} className={styles.railImage} tabIndex={-1}>
                <Image src={product.image.src} alt={product.image.alt} fill sizes="320px" className={styles.railImg} />
            </Link>
            <div className={styles.railMeta}>
                <div>
                    <h3 className={styles.railName}>
                        <Link href={`/shop/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className={styles.railPrice}>{isCustom ? 'A medida' : formatCOP(product.price as number)}</p>
                </div>
                {isCustom
                    ? <Link href={`/shop/${product.slug}`} className={styles.railAction} aria-label={`Cotizar ${product.name}`}><Plus /></Link>
                    : <button type="button" className={styles.railAction} onClick={onAdd} aria-label={`Agregar ${product.name} al carrito`}><Plus /></button>}
            </div>
        </article>
    );
};

export default DepthLine;
