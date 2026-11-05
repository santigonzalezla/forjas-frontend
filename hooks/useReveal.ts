'use client';

import {useEffect, type RefObject} from 'react';
import {animate, onScroll, splitText, stagger} from 'animejs';

const SELECTOR = '[data-reveal], [data-reveal-words], [data-parallax]';

type Cleanup = () => void;

const setupElement = (el: HTMLElement, reduced: boolean): Cleanup =>
{
    if (el.hasAttribute('data-reveal'))
    {
        if (reduced)
        {
            el.style.opacity = '1';
            return () => {};
        }
        const animation = animate(el, {
            opacity:  [0, 1],
            y:        [18, 0],
            duration: 700,
            ease:     'out(3)',
            autoplay: onScroll({target: el, enter: 'bottom-=40 top'}),
        });
        return () => animation.revert();
    }

    if (reduced) return () => {};

    if (el.hasAttribute('data-reveal-words'))
    {
        const splitter  = splitText(el, {words: {wrap: 'clip'}});
        const animation = animate(splitter.words, {
            y:        ['110%', '0%'],
            duration: 850,
            delay:    stagger(60),
            ease:     'out(4)',
            autoplay: onScroll({target: el, enter: 'bottom-=60 top'}),
        });
        return () =>
        {
            animation.revert();
            splitter.revert();
        };
    }

    const amount    = Number(el.dataset.parallax) || 40;
    const animation = animate(el, {
        y:        [-amount, amount],
        ease:     'linear',
        autoplay: onScroll({target: el, enter: 'bottom top', leave: 'top bottom', sync: true}),
    });
    return () => animation.revert();
};

const collect = (node: Node): HTMLElement[] =>
{
    if (!(node instanceof HTMLElement)) return [];
    const found = Array.from(node.querySelectorAll<HTMLElement>(SELECTOR));
    return node.matches(SELECTOR) ? [node, ...found] : found;
};

export function useReveal(rootRef?: RefObject<HTMLElement | null>)
{
    useEffect(() =>
    {
        const reduced  = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const root     = rootRef?.current ?? document.body;
        const cleanups = new Map<HTMLElement, Cleanup>();

        const add = (el: HTMLElement) =>
        {
            if (!cleanups.has(el)) cleanups.set(el, setupElement(el, reduced));
        };

        const remove = (el: HTMLElement) =>
        {
            cleanups.get(el)?.();
            cleanups.delete(el);
        };

        collect(root).forEach(add);

        const observer = new MutationObserver(mutations =>
        {
            for (const mutation of mutations)
            {
                mutation.removedNodes.forEach(node => collect(node).forEach(remove));
                mutation.addedNodes.forEach(node => collect(node).forEach(add));
            }
        });
        observer.observe(root, {childList: true, subtree: true});

        return () =>
        {
            observer.disconnect();
            cleanups.forEach(cleanup => cleanup());
            cleanups.clear();
        };
    }, [rootRef]);
}
