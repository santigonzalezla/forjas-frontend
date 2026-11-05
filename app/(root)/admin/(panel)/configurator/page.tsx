'use client';

import Link from 'next/link';
import {useState, type FormEvent} from 'react';
import {toast} from 'sonner';
import form from '@/app/components/admin/adminform/adminform.module.css';
import styles from './configurator.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import Field, {Input} from '@/app/components/ui/field/Field';
import Toggle from '@/app/components/ui/toggle/Toggle';
import Button from '@/app/components/ui/button/Button';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {External} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useErrorToast} from '@/hooks/useErrorToast';
import {useAuth} from '@/context/AuthContext';
import {EXTRAS, ORNAMENTS, PATTERNS, PIECES, STYLES} from '@/lib/configurator';
import {FINISHES} from '@/lib/finishes';
import {UserRole, type ApiPricing} from '@/app/interfaces/admin';

const toPercent   = (multiplier: number) => String(Math.round((multiplier - 1) * 1000) / 10);
const fromPercent = (value: string) => 1 + Number(value || 0) / 100;
const pct         = (fraction: number) => String(Math.round(fraction * 1000) / 10);
const money       = (value: string) => Number(value.replace(/\D/g, '') || 0);

type Draft = Record<string, string | boolean>;

type OrnamentalId = keyof ApiPricing['types'];
type FurnitureId  = keyof ApiPricing['pieces'];

const ORNAMENTAL = PIECES.filter(piece => piece.family === 'ornamental') as (typeof PIECES[number] & {id: OrnamentalId})[];
const FURNITURE  = PIECES.filter(piece => piece.family !== 'ornamental') as (typeof PIECES[number] & {id: FurnitureId})[];

const FINISH_ROWS: {id: keyof ApiPricing['finishes']; label: string}[] = [...FINISHES, {id: 'pintado' as const, label: 'Pintado a color'}];

const toDraft = (p: ApiPricing): Draft => ({
    isSample: p.isSample,
    spread:   pct(p.spread),
    ...Object.fromEntries(ORNAMENTAL.flatMap(({id}) => [[`rate.${id}`, String(p.types[id].rate)], [`min.${id}`, String(p.types[id].minPrice)]])),
    ...Object.fromEntries(FURNITURE.flatMap(({id, sizes}) => (sizes ?? []).map(size => [`piece.${id}.${size.id}`, String(p.pieces[id][size.id] ?? '')]))),
    ...Object.fromEntries(PATTERNS.map(({id}) => [`pattern.${id}`, toPercent(p.patterns[id])])),
    ...Object.fromEntries(STYLES.map(({id}) => [`style.${id}`, toPercent(p.styles[id])])),
    ...Object.fromEntries(ORNAMENTS.flatMap(({id}) => [[`orn.${id}.percent`, pct(p.ornaments[id].percent)], [`orn.${id}.flat`, String(p.ornaments[id].flat)]])),
    ...Object.fromEntries(FINISH_ROWS.map(({id}) => [`finish.${id}`, toPercent(p.finishes[id])])),
    ...Object.fromEntries(EXTRAS.map(({id}) => [`extra.${id}`, String(p.extras[id])])),
});

const fromDraft = (d: Draft, base: ApiPricing): ApiPricing => ({
    isSample:  d.isSample as boolean,
    spread:    Number(d.spread || 0) / 100,
    types:     Object.fromEntries(ORNAMENTAL.map(({id}) => [id, {rate: money(d[`rate.${id}`] as string), minPrice: money(d[`min.${id}`] as string), measure: base.types[id].measure}])) as ApiPricing['types'],
    pieces:    Object.fromEntries(FURNITURE.map(({id, sizes}) => [id, Object.fromEntries((sizes ?? []).map(size => [size.id, money(d[`piece.${id}.${size.id}`] as string)]))])) as ApiPricing['pieces'],
    patterns:  Object.fromEntries(PATTERNS.map(({id}) => [id, fromPercent(d[`pattern.${id}`] as string)])) as ApiPricing['patterns'],
    styles:    Object.fromEntries(STYLES.map(({id}) => [id, fromPercent(d[`style.${id}`] as string)])) as ApiPricing['styles'],
    ornaments: Object.fromEntries(ORNAMENTS.map(({id}) => [id, {percent: Number(d[`orn.${id}.percent`] || 0) / 100, flat: money(d[`orn.${id}.flat`] as string)}])) as ApiPricing['ornaments'],
    finishes:  Object.fromEntries(FINISH_ROWS.map(({id}) => [id, fromPercent(d[`finish.${id}`] as string)])) as ApiPricing['finishes'],
    extras:    Object.fromEntries(EXTRAS.map(({id}) => [id, money(d[`extra.${id}`] as string)])) as ApiPricing['extras'],
});

const PricingForm = ({pricing, onSaved}: {pricing: ApiPricing; onSaved: () => void}) =>
{
    const [draft, setDraft] = useState<Draft>(() => toDraft(pricing));
    const {execute: save, isLoading: saving, error} = useFetch<ApiPricing>('configurator/pricing', {method: 'PUT', immediate: false});
    useErrorToast(error);

    const set     = (key: string, value: string | boolean) => setDraft(previous => ({...previous, [key]: value}));
    const text    = (key: string) => draft[key] as string;
    const digits  = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => set(key, event.target.value.replace(/\D/g, ''));
    const decimal = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => set(key, event.target.value.replace(/[^\d.-]/g, ''));

    const handleSubmit = async (event: FormEvent) =>
    {
        event.preventDefault();
        if (!await save({body: fromDraft(draft, pricing)})) return;
        toast.success('Tarifas guardadas. El configurador ya usa los nuevos valores.');
        onSaved();
    };

    return (
        <form className={form.layout} onSubmit={handleSubmit}>
            <div className={form.main}>
                <section className={form.card}>
                    <h2 className={form.cardTitle}>Ornamentación: precio base</h2>
                    <p className={styles.help}>Portones, puertas y rejas se cobran por metro cuadrado; las barandas por metro lineal. Si el cálculo da menos que el mínimo, se cobra el mínimo.</p>
                    <div className={styles.grid}>
                        <span className={styles.head}>Pieza</span><span className={styles.head}>Valor</span><span className={styles.head}>Mínimo</span>
                        {ORNAMENTAL.map(piece => (
                            <div key={piece.id} className={styles.line}>
                                <span className={styles.name}>{piece.label}</span>
                                <Field label={pricing.types[piece.id].measure === 'area' ? 'COP por m²' : 'COP por metro'} htmlFor={`rate-${piece.id}`}>
                                    <Input id={`rate-${piece.id}`} inputMode="numeric" required value={text(`rate.${piece.id}`)} onChange={digits(`rate.${piece.id}`)} />
                                </Field>
                                <Field label="COP mínimo" htmlFor={`min-${piece.id}`}>
                                    <Input id={`min-${piece.id}`} inputMode="numeric" required value={text(`min.${piece.id}`)} onChange={digits(`min.${piece.id}`)} />
                                </Field>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={form.card}>
                    <h2 className={form.cardTitle}>Muebles y decoración: precio por tamaño</h2>
                    <p className={styles.help}>Precio de cada mueble, lámpara o matera según el tamaño que elige el cliente. A este valor se le suman los recargos por pintura y acabado.</p>
                    {FURNITURE.map(piece => (
                        <div key={piece.id} className={form.row}>
                            {piece.sizes?.map(size => (
                                <Field key={size.id} label={`${piece.label} · ${size.label} (COP)`} htmlFor={`piece-${piece.id}-${size.id}`}>
                                    <Input id={`piece-${piece.id}-${size.id}`} inputMode="numeric" required value={text(`piece.${piece.id}.${size.id}`)} onChange={digits(`piece.${piece.id}.${size.id}`)} />
                                </Field>
                            ))}
                        </div>
                    ))}
                    <p className={styles.help}>Recargo por la pintura del tablero, asiento o tanque (%).</p>
                    <div className={form.row}>
                        {PATTERNS.map(pattern => (
                            <Field key={pattern.id} label={`${pattern.label} (%)`} htmlFor={`pattern-${pattern.id}`} hint={pattern.hint}>
                                <Input id={`pattern-${pattern.id}`} inputMode="decimal" required value={text(`pattern.${pattern.id}`)} onChange={decimal(`pattern.${pattern.id}`)} />
                            </Field>
                        ))}
                    </div>
                </section>

                <section className={form.card}>
                    <h2 className={form.cardTitle}>Recargos por estilo y acabado</h2>
                    <p className={styles.help}>Porcentaje que se suma al precio base. 0 = sin recargo.</p>
                    <div className={form.row}>
                        {STYLES.map(style => (
                            <Field key={style.id} label={`${style.label} (%)`} htmlFor={`style-${style.id}`}>
                                <Input id={`style-${style.id}`} inputMode="decimal" required value={text(`style.${style.id}`)} onChange={decimal(`style.${style.id}`)} />
                            </Field>
                        ))}
                    </div>
                    <div className={form.row}>
                        {FINISH_ROWS.map(finish => (
                            <Field key={finish.id} label={`${finish.label} (%)`} htmlFor={`finish-${finish.id}`}>
                                <Input id={`finish-${finish.id}`} inputMode="decimal" required value={text(`finish.${finish.id}`)} onChange={decimal(`finish.${finish.id}`)} />
                            </Field>
                        ))}
                    </div>
                </section>

                <section className={form.card}>
                    <h2 className={form.cardTitle}>Motivos y extras</h2>
                    <p className={styles.help}>Cada ornamento puede sumar un porcentaje del precio, un valor fijo, o ambos.</p>
                    <div className={styles.grid}>
                        <span className={styles.head}>Motivo</span><span className={styles.head}>Porcentaje</span><span className={styles.head}>Valor fijo</span>
                        {ORNAMENTS.map(ornament => (
                            <div key={ornament.id} className={styles.line}>
                                <span className={styles.name}>{ornament.label}</span>
                                <Field label="%" htmlFor={`orn-${ornament.id}-p`}>
                                    <Input id={`orn-${ornament.id}-p`} inputMode="decimal" required value={text(`orn.${ornament.id}.percent`)} onChange={decimal(`orn.${ornament.id}.percent`)} />
                                </Field>
                                <Field label="COP" htmlFor={`orn-${ornament.id}-f`}>
                                    <Input id={`orn-${ornament.id}-f`} inputMode="numeric" required value={text(`orn.${ornament.id}.flat`)} onChange={digits(`orn.${ornament.id}.flat`)} />
                                </Field>
                            </div>
                        ))}
                    </div>
                    <div className={form.row}>
                        {EXTRAS.map(extra => (
                            <Field key={extra.id} label={`${extra.label} (COP)`} htmlFor={`extra-${extra.id}`} hint={extra.onlyFor ? 'Solo portones' : undefined}>
                                <Input id={`extra-${extra.id}`} inputMode="numeric" required value={text(`extra.${extra.id}`)} onChange={digits(`extra.${extra.id}`)} />
                            </Field>
                        ))}
                    </div>
                </section>
            </div>

            <aside className={form.side}>
                <section className={form.card}>
                    <h2 className={form.cardTitle}>Publicación</h2>
                    <Field label="Margen del rango (%)" htmlFor="spread" hint="El cliente ve el precio como un rango: ± este porcentaje alrededor del cálculo.">
                        <Input id="spread" inputMode="decimal" required value={text('spread')} onChange={decimal('spread')} />
                    </Field>
                    <Toggle id="isSample" label="Valores de ejemplo" hint={draft.isSample ? 'El configurador muestra el aviso de valores de ejemplo.' : 'Se muestran como tarifas reales del taller.'} checked={draft.isSample as boolean} onChange={checked => set('isSample', checked)} />
                    <Button type="submit" loading={saving}>Guardar tarifas</Button>
                    <ButtonLink href="/design" variant="secondary" external icon={<External />}>Probar en el configurador</ButtonLink>
                </section>
            </aside>
        </form>
    );
};

export default function ConfiguratorPricingPage()
{
    const {user}  = useAuth();
    const isAdmin = user?.role === UserRole.ADMIN;

    const {data: pricing, execute: reload} = useFetch<ApiPricing>('configurator/pricing', {immediate: isAdmin});

    if (user && !isAdmin)
        return <p className={styles.state}>Solo el administrador puede cambiar las tarifas. <Link href="/admin">Volver al resumen</Link></p>;

    return (
        <>
            <PageHeader title="Configurador 3D" description="Tarifas con las que se calcula el precio estimado que ve el cliente al diseñar su pieza." />
            {pricing
                ? <PricingForm key={JSON.stringify(pricing)} pricing={pricing} onSaved={reload} />
                : <p className={styles.state}>Cargando…</p>}
        </>
    );
}
