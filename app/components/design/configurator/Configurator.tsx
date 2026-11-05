'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {toast} from 'sonner';
import styles from './configurator.module.css';
import PieceStage from '@/app/components/three/piecestage/PieceStage';
import RangeField from '@/app/components/design/rangefield/RangeField';
import Field, {Input, Textarea} from '@/app/components/ui/field/Field';
import Button from '@/app/components/ui/button/Button';
import ConsentCheck from '@/app/components/forms/consentcheck/ConsentCheck';
import Honeypot from '@/app/components/forms/honeypot/Honeypot';
import FormSuccess from '@/app/components/forms/formsuccess/FormSuccess';
import {WhatsApp} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useDebounce} from '@/hooks/useDebounce';
import {useQuoteSubmit} from '@/hooks/useQuoteSubmit';
import {
    EXTRAS, FAMILIES, LASER_MOTIFS, ORNAMENTS, ORNAMENT_GROUPS, PATTERNS, PIECES, STEPS, STYLES,
    changeType, defaultDesign, describeDesign, designPayload, normalizeDesign, presetForSlug, designToQuery, findPiece, finishLabel, isExtraAllowed, isOrnamentAllowed, toggleOrnament,
    type Design, type DesignFinish, type Extra,
} from '@/lib/configurator';
import {FINISHES} from '@/lib/finishes';
import {PALETTE, findColor, type PaletteId} from '@/lib/palette';
import {formatCOP} from '@/lib/format';
import {SERVER_URL} from '@/lib/constants';
import {buildWhatsAppLink} from '@/lib/whatsapp';

interface Estimate
{
    min:      number;
    max:      number;
    isSample: boolean;
}

interface ConfiguratorProps
{
    initialDesign: Design;
    product?:      {slug: string; name: string};
}

const CUSHIONS: {id: Design['cushion']; label: string; hint: string}[] = [
    {id: 'plain', label: 'Blanco', hint: 'Tela lisa'},
    {id: 'print', label: 'Estampado', hint: 'Tela con motivos de color'},
];

const toggle = <T,>(list: T[], item: T): T[] => (list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

// Muestra de la opción "pintado": un círculo con varios colores de la paleta
const PAINTED_SWATCH = `conic-gradient(${['rojo', 'amarillo', 'verde', 'turquesa', 'azul', 'morado', 'rojo'].map(id => findColor(id as PaletteId).hex).join(', ')})`;

// ─── Selectores reutilizables ────────────────────────────────────────────────
const ColorSwatches = ({label, value, onChange}: {label: string; value: PaletteId; onChange: (id: PaletteId) => void}) => (
    <fieldset className={styles.group}>
        <legend className={styles.legend}>{label} · <span>{findColor(value).label}</span></legend>
        <div className={styles.swatches} data-dense>
            {PALETTE.map(color => (
                <button
                    key={color.id}
                    type="button"
                    className={styles.swatch}
                    style={{background: color.hex}}
                    aria-label={color.label}
                    aria-pressed={color.id === value}
                    onClick={() => onChange(color.id)}
                />
            ))}
        </div>
    </fieldset>
);

// Acabado de la estructura: metales o pintado con un color de la paleta
const FinishPicker = ({design, onChange}: {design: Design; onChange: (patch: Partial<Design>) => void}) => (
    <>
        <fieldset className={styles.group}>
            <legend className={styles.legend}>Acabado · <span>{finishLabel(design)}</span></legend>
            <div className={styles.swatches}>
                {FINISHES.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        className={styles.swatch}
                        style={{background: option.swatch}}
                        aria-label={option.label}
                        aria-pressed={option.id === design.finish}
                        onClick={() => onChange({finish: option.id})}
                    />
                ))}
                <button
                    type="button"
                    className={styles.swatch}
                    style={{background: PAINTED_SWATCH}}
                    aria-label="Pintado a color"
                    aria-pressed={design.finish === 'pintado'}
                    onClick={() => onChange({finish: 'pintado' as DesignFinish})}
                />
            </div>
        </fieldset>
        {design.finish === 'pintado' && (
            <ColorSwatches label="Color de la estructura" value={design.colors.frame} onChange={frame => onChange({colors: {...design.colors, frame}})} />
        )}
    </>
);

const Configurator = ({initialDesign, product}: ConfiguratorProps) =>
{
    const [design, setDesign] = useState(initialDesign);
    // Si viene de un producto de la tienda la pieza ya está elegida: se arranca en el paso 2
    const [step,   setStep]   = useState(product ? 1 : 0);

    const piece = findPiece(design.type);
    const steps = STEPS[piece.family];

    // ─── Estimado en vivo (el backend aplica las tarifas que edita el dueño) ───
    const debounced = useDebounce(design, 350);
    const {data: estimate, error: estimateError, execute: estimateNow, isLoading: estimating} =
        useFetch<Estimate>('configurator/estimate', {method: 'POST', immediate: false, requiresAuth: false});

    useEffect(() =>
    {
        estimateNow({body: designPayload(debounced)});
    }, [debounced, estimateNow]);

    // ─── El diseño vive en la URL: recargar o compartir el enlace lo conserva ───
    const query     = designToQuery(design) + (product ? `&piece=${product.slug}` : '');
    const shareLink = `${SERVER_URL}/design?${query}`;

    useEffect(() =>
    {
        window.history.replaceState(window.history.state, '', `/design?${query}`);
    }, [query]);

    const update = (patch: Partial<Design>) => setDesign(current => ({...current, ...patch}));

    // Vuelve a los valores iniciales de la pieza actual (con la variante del producto, si aplica)
    const resetDesign = () =>
    {
        const fromProduct = product && initialDesign.type === design.type;
        setDesign(fromProduct ? normalizeDesign({...defaultDesign(design.type), ...presetForSlug(product.slug)}) : defaultDesign(design.type));
        toast.success('Diseño restablecido');
    };

    const copyLink = async () =>
    {
        try
        {
            await navigator.clipboard.writeText(shareLink);
            toast.success('Enlace copiado. Compártelo para que vean el mismo diseño.');
        }
        catch
        {
            toast.error('No se pudo copiar el enlace');
        }
    };

    const summary  = describeDesign(design);
    const range    = estimate ? `${formatCOP(estimate.min)} – ${formatCOP(estimate.max)}` : null;
    const whatsapp = buildWhatsAppLink(`Hola, diseñé esta pieza en la página: ${summary}.${range ? ` Estimado: ${range}.` : ''} ${shareLink}`);

    // ─── Envío como solicitud de diseño ─────────────────────────────────────────
    const {submit, isLoading: sending, created} = useQuoteSubmit();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        await submit('DESIGN', {
            design:      designPayload(design),
            projectType: piece.label,
            productSlug: product?.slug,
            widthCm:     design.widthCm,
            heightCm:    design.heightCm,
            name:        form.get('name')?.toString().trim(),
            phone:       form.get('phone')?.toString().trim(),
            email:       form.get('email')?.toString().trim(),
            city:        form.get('city')?.toString().trim(),
            message:     form.get('message')?.toString().trim(),
            consent:     form.get('consent') === 'true',
            website:     form.get('website')?.toString(),
        });
    };

    // ─── Pasos ──────────────────────────────────────────────────────────────────
    const pieceStep = (
        <div className={styles.stack}>
            {FAMILIES.map(family => (
                <fieldset key={family.id} className={styles.group}>
                    <legend className={styles.legend}>{family.label}</legend>
                    <div className={styles.options} role="radiogroup" aria-label={family.label}>
                        {PIECES.filter(option => option.family === family.id).map(option => (
                            <button
                                key={option.id}
                                type="button"
                                role="radio"
                                aria-checked={option.id === design.type}
                                className={styles.option}
                                data-active={option.id === design.type}
                                onClick={() => setDesign(current => (current.type === option.id ? current : changeType(current, option.id)))}
                            >
                                <span className={styles.optionLabel}>{option.label}</span>
                                <span className={styles.optionHint}>{option.hint}</span>
                            </button>
                        ))}
                    </div>
                </fieldset>
            ))}
        </div>
    );

    const ornamentalSteps = [
        pieceStep,
        <div key="measures" className={styles.stack}>
            <RangeField id="width" label={piece.widthLabel} value={design.widthCm} min={piece.width.min} max={piece.width.max} onChange={widthCm => update({widthCm})} />
            <RangeField id="height" label="Alto" value={design.heightCm} min={piece.height.min} max={piece.height.max} onChange={heightCm => update({heightCm})} />
            <p className={styles.note}>
                {design.type === 'gate' && design.widthCm > 180 ? 'Con más de 1,80 m lo hacemos en dos hojas. ' : ''}
                Medidas aproximadas: las confirmamos en la visita técnica.
            </p>
        </div>,
        <div key="style" className={styles.stack}>
            <div className={styles.options} role="radiogroup" aria-label="Estilo">
                {STYLES.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={option.id === design.style}
                        className={styles.option}
                        data-active={option.id === design.style}
                        onClick={() => setDesign(current => normalizeDesign({...current, style: option.id}))}
                    >
                        <span className={styles.optionLabel}>{option.label}</span>
                        <span className={styles.optionHint}>{option.hint}</span>
                    </button>
                ))}
            </div>
            {design.style === 'laser' && (
                <>
                    <fieldset className={styles.group}>
                        <legend className={styles.legend}>Diseño del corte</legend>
                        <div className={styles.options} role="radiogroup" aria-label="Diseño del corte láser">
                            {LASER_MOTIFS.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={option.id === design.laserMotif}
                                    className={styles.option}
                                    data-active={option.id === design.laserMotif}
                                    onClick={() => update({laserMotif: option.id})}
                                >
                                    <span className={styles.optionLabel}>{option.label}</span>
                                    <span className={styles.optionHint}>{option.hint}</span>
                                </button>
                            ))}
                        </div>
                        <p className={styles.note}>Lámina de acero cortada con láser dentro de un marco de tubo. También hacemos el diseño que nos traigas.</p>
                    </fieldset>
                    {isOrnamentAllowed('arch', design.type, design.style) && (
                        <div className={styles.chips}>
                            <button type="button" className={styles.chip} aria-pressed={design.ornaments.includes('arch')} onClick={() => update({ornaments: toggleOrnament(design.ornaments, 'arch')})}>
                                Remate en arco
                            </button>
                        </div>
                    )}
                </>
            )}
            {design.style !== 'laser' && ORNAMENT_GROUPS.map(group => (
                <fieldset key={group.id} className={styles.group}>
                    <legend className={styles.legend}>{group.label}</legend>
                    <div className={styles.chips}>
                        {ORNAMENTS.filter(option => option.group === group.id).map(option => (
                            <button
                                key={option.id}
                                type="button"
                                className={styles.chip}
                                aria-pressed={design.ornaments.includes(option.id)}
                                disabled={!isOrnamentAllowed(option.id, design.type, design.style)}
                                onClick={() => update({ornaments: toggleOrnament(design.ornaments, option.id)})}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {group.hint && <p className={styles.note}>{group.hint}</p>}
                </fieldset>
            ))}
            {design.style === 'modern' && <p className={styles.note}>En el estilo moderno de platinas no se ven los remates ni los barrotes torcidos.</p>}
        </div>,
        <div key="finish" className={styles.stack}>
            <FinishPicker design={design} onChange={update} />
            <fieldset className={styles.group}>
                <legend className={styles.legend}>Extras</legend>
                <div className={styles.chips}>
                    {EXTRAS.filter(option => isExtraAllowed(option.id, design.type)).map(option => (
                        <button
                            key={option.id}
                            type="button"
                            className={styles.chip}
                            aria-pressed={design.extras.includes(option.id)}
                            onClick={() => update({extras: toggle<Extra>(design.extras, option.id)})}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </fieldset>
        </div>,
    ];

    const furnitureSteps = [
        pieceStep,
        <div key="size" className={styles.options} role="radiogroup" aria-label="Tamaño">
            {piece.sizes?.map(option => (
                <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={option.id === design.size}
                    className={styles.option}
                    data-active={option.id === design.size}
                    onClick={() => update({size: option.id, widthCm: option.widthCm, heightCm: option.heightCm})}
                >
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionHint}>{option.hint}</span>
                </button>
            ))}
        </div>,
        <div key="paint" className={styles.stack}>
            {(piece.patterns?.length ?? 0) > 1 && (
                <fieldset className={styles.group}>
                    <legend className={styles.legend}>{piece.accentLabel}</legend>
                    <div className={styles.options} role="radiogroup" aria-label={`Pintura de ${piece.accentLabel?.toLowerCase()}`}>
                        {PATTERNS.filter(option => piece.patterns?.includes(option.id)).map(option => (
                            <button
                                key={option.id}
                                type="button"
                                role="radio"
                                aria-checked={option.id === design.pattern}
                                className={styles.option}
                                data-active={option.id === design.pattern}
                                onClick={() => update({pattern: option.id})}
                            >
                                <span className={styles.optionLabel}>{option.label}</span>
                                <span className={styles.optionHint}>{option.hint}</span>
                            </button>
                        ))}
                    </div>
                </fieldset>
            )}
            <ColorSwatches
                label={design.pattern === 'solid' ? `Color de ${piece.accentLabel?.toLowerCase()}` : 'Color de fondo'}
                value={design.colors.accent}
                onChange={accent => update({colors: {...design.colors, accent}})}
            />
            {design.pattern !== 'solid' && <p className={styles.note}>Los demás colores se combinan a mano en el taller; el diseño final lo acordamos contigo.</p>}
            {piece.cushions && (
                <fieldset className={styles.group}>
                    <legend className={styles.legend}>Cojines</legend>
                    <div className={styles.options} role="radiogroup" aria-label="Tela de los cojines">
                        {CUSHIONS.map(option => (
                            <button
                                key={option.id}
                                type="button"
                                role="radio"
                                aria-checked={option.id === design.cushion}
                                className={styles.option}
                                data-active={option.id === design.cushion}
                                onClick={() => update({cushion: option.id})}
                            >
                                <span className={styles.optionLabel}>{option.label}</span>
                                <span className={styles.optionHint}>{option.hint}</span>
                            </button>
                        ))}
                    </div>
                </fieldset>
            )}
        </div>,
        <div key="frame" className={styles.stack}>
            <FinishPicker design={design} onChange={update} />
        </div>,
    ];

    const configSteps = piece.family === 'ornamental' ? ornamentalSteps : furnitureSteps;

    return (
        <div className={styles.layout}>
            <div className={styles.stage}>
                <PieceStage design={design} />
            </div>

            <aside className={styles.panel} aria-label="Opciones del diseño">
                <nav className={styles.steps} aria-label="Pasos del diseño">
                    {steps.map((label, index) => (
                        <button
                            key={label}
                            type="button"
                            className={styles.stepTab}
                            data-state={index < step ? 'done' : index === step ? 'current' : 'next'}
                            aria-current={index === step ? 'step' : undefined}
                            onClick={() => setStep(index)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                {product && <p className={styles.product}>Basado en <strong>{product.name}</strong></p>}

                <div className={styles.body}>
                    {step < steps.length - 1 && configSteps[step]}

                    {step === steps.length - 1 && (created
                        ? (
                            <FormSuccess
                                title="Diseño enviado"
                                text="Lo revisamos y te contactamos para confirmar los detalles y darte el precio final."
                                numId={created.numId}
                                whatsapp={`Hola, envié un diseño desde la página: ${summary}`}
                            />
                        )
                        : (
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <p className={styles.summary}>{summary}</p>
                                <div className={styles.row}>
                                    <Field label="Nombre" htmlFor="name">
                                        <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
                                    </Field>
                                    <Field label="Celular o WhatsApp" htmlFor="phone">
                                        <Input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required pattern="[+\d\s()\-]{7,20}" />
                                    </Field>
                                </div>
                                <div className={styles.row}>
                                    <Field label="Correo" htmlFor="email" hint="Opcional">
                                        <Input id="email" name="email" type="email" autoComplete="email" />
                                    </Field>
                                    <Field label="Ciudad" htmlFor="city">
                                        <Input id="city" name="city" autoComplete="address-level2" defaultValue="Valledupar" maxLength={80} />
                                    </Field>
                                </div>
                                <Field label="Comentarios" htmlFor="message" hint="Opcional">
                                    <Textarea id="message" name="message" maxLength={2000} rows={3} />
                                </Field>
                                <ConsentCheck />
                                <Honeypot />
                                <Button type="submit" loading={sending} loadingText="Enviando…">Enviar diseño</Button>
                            </form>
                        ))}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.estimate} aria-live="polite">
                        <span className={styles.estimateLabel}>Precio estimado</span>
                        <span className={styles.estimateValue} data-loading={estimating}>
                            {range ?? (estimateError ? 'No disponible' : 'Calculando…')}
                        </span>
                        <span className={styles.estimateNote}>
                            {estimate?.isSample ? 'Valores de ejemplo mientras el taller confirma sus tarifas. ' : ''}
                            {piece.family === 'ornamental' ? 'El precio final se confirma en la visita técnica.' : 'El precio final se confirma al aprobar el diseño.'}
                        </span>
                    </div>
                    <div className={styles.footerActions}>
                        {step < steps.length - 1 && <Button onClick={() => setStep(step + 1)}>{step === steps.length - 2 ? 'Enviar diseño' : 'Siguiente'}</Button>}
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={styles.iconButton} aria-label="Enviar por WhatsApp"><WhatsApp /></a>
                        <span className={styles.links}>
                            <button type="button" className={styles.linkButton} onClick={resetDesign}>Restablecer</button>
                            <button type="button" className={styles.linkButton} onClick={copyLink}>Copiar enlace</button>
                        </span>
                    </div>
                </footer>
            </aside>
        </div>
    );
};

export default Configurator;
