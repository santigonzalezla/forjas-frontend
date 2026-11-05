import {buildRosette} from '@/lib/rosette';
import {ORNAMENTS, type Design, type Ornament} from '@/lib/configurator';

export type Vec2 = [number, number];

export interface Bar
{
    a:      Vec2;
    b:      Vec2;
    t:      number;
    d:      number;
    twist?: boolean;
}

export interface Curve
{
    points: Vec2[];
    radius: number;
    closed: boolean;
}

export interface Tip
{
    at:   Vec2;
    size: number;
}

export interface Rect
{
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export interface IronworkModel
{
    bars:    Bar[];
    curves:  Curve[];
    tips:    Tip[];
    balls:   Tip[];
    accents: Bar[];
    laser:   Rect[];
    width:   number;
    height:  number;
}

const FRAME   = 0.04;
const PICKET  = 0.016;
const RAIL    = 0.03;
const POST    = 0.1;
const SCROLL  = 0.006;
const SPEAR_H = 0.09;
const BALL_R  = 0.022;

interface Panel
{
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

type TopFn    = (x: number) => number;
type Interval = [number, number];
type Circle   = {cx: number; cy: number; r: number};
type BandMotif = 'scrolls' | 'hearts' | 'rings';

const bar = (a: Vec2, b: Vec2, t: number, d = t, twist = false): Bar => ({a, b, t, d, ...(twist && {twist})});

const bandMotifsOf = (design: Design): BandMotif[] =>
    design.ornaments.filter((o): o is BandMotif => ORNAMENTS.find(x => x.id === o)?.group === 'band');

const spiral = (cx: number, cy: number, r0: number, r1: number, start: number, turns: number, steps = 26): Vec2[] =>
    Array.from({length: steps + 1}, (_, i) =>
    {
        const t = i / steps;
        const angle = start + t * turns * Math.PI * 2;
        const r = r0 + (r1 - r0) * t;
        return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    });

const circle = (cx: number, cy: number, r: number, steps = 28): Vec2[] =>
    Array.from({length: steps}, (_, i) => [cx + Math.cos((i / steps) * Math.PI * 2) * r, cy + Math.sin((i / steps) * Math.PI * 2) * r]);

const cScrollPair = (cx: number, cy: number, r: number): Curve[] => [
    {points: spiral(cx - r, cy, r, r * 0.22, 0, 1.15), radius: SCROLL, closed: false},
    {points: spiral(cx + r, cy, r, r * 0.22, Math.PI, -1.15), radius: SCROLL, closed: false},
];

const cubic = (p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, steps = 14): Vec2[] =>
    Array.from({length: steps + 1}, (_, i) =>
    {
        const t = i / steps;
        const m = 1 - t;
        return [
            m ** 3 * p0[0] + 3 * m ** 2 * t * p1[0] + 3 * m * t ** 2 * p2[0] + t ** 3 * p3[0],
            m ** 3 * p0[1] + 3 * m ** 2 * t * p1[1] + 3 * m * t ** 2 * p2[1] + t ** 3 * p3[1],
        ];
    });

const heart = (cx: number, bottom: number, height: number, width: number): Curve[] =>
{
    const w = width;
    const h = height;
    const b = bottom + h * 0.04;
    const half = (side: 1 | -1): Vec2[] =>
    {
        const x = (dx: number) => cx + side * dx * w;
        const curlCenter: Vec2 = [x(-0.21), b + h * 0.66];
        const cusp: Vec2       = [x(-0.04), b + h * 0.74];
        const r0    = Math.hypot(cusp[0] - curlCenter[0], cusp[1] - curlCenter[1]);
        const start = Math.atan2(cusp[1] - curlCenter[1], cusp[0] - curlCenter[0]);

        return [
            ...cubic([cx, b], [x(-0.12), b + h * 0.22], [x(-0.5), b + h * 0.38], [x(-0.5), b + h * 0.66]),
            ...cubic([x(-0.5), b + h * 0.66], [x(-0.5), b + h * 0.97], [x(-0.08), b + h], cusp).slice(1),
            ...spiral(curlCenter[0], curlCenter[1], r0, w * 0.035, start, side * -0.8, 16).slice(1),
        ];
    };

    return [
        {points: half(1), radius: SCROLL, closed: false},
        {points: half(-1), radius: SCROLL, closed: false},
    ];
};

const divide = (from: number, to: number, pitch: number): number[] =>
{
    const count = Math.max(1, Math.round((to - from) / pitch));
    const step  = (to - from) / count;
    return Array.from({length: count - 1}, (_, i) => from + step * (i + 1));
};

const freeSegments = (x: number, y0: number, y1: number, blocked: Interval[], circle: Circle | null): Interval[] =>
{
    const all: Interval[] = [...blocked];
    if (circle && Math.abs(x - circle.cx) < circle.r)
    {
        const half = Math.sqrt(circle.r ** 2 - (x - circle.cx) ** 2);
        all.push([circle.cy - half, circle.cy + half]);
    }
    all.sort((a, b) => a[0] - b[0]);

    const segments: Interval[] = [];
    let cursor = y0;
    for (const [a, b] of all)
    {
        if (a > cursor) segments.push([cursor, Math.min(a, y1)]);
        cursor = Math.max(cursor, b);
    }
    if (cursor < y1) segments.push([cursor, y1]);
    return segments.filter(([a, b]) => b - a > 0.01);
};

const band = (model: IronworkModel, motif: BandMotif, x0: number, x1: number, bottom: number, height: number) =>
{
    model.bars.push(bar([x0, bottom], [x1, bottom], RAIL * 0.7), bar([x0, bottom + height], [x1, bottom + height], RAIL * 0.7));

    const cellTarget = motif === 'rings' ? height * 0.95 : motif === 'hearts' ? Math.max(0.22, height * 1.2) : 0.28;
    const cells      = Math.max(1, Math.round((x1 - x0) / cellTarget));
    const cw         = (x1 - x0) / cells;

    for (let k = 0; k < cells; k++)
    {
        const cx = x0 + cw * (k + 0.5);
        if (k > 0) model.bars.push(bar([x0 + cw * k, bottom], [x0 + cw * k, bottom + height], PICKET));

        if (motif === 'scrolls')
        {
            const r  = Math.min(cw * 0.22, height * 0.34);
            const cy = bottom + height / 2 + r * 0.15;
            model.curves.push(...cScrollPair(cx, cy, r));
            model.bars.push(bar([cx, bottom], [cx, cy], 0.012));
        }
        else if (motif === 'hearts')
        {
            model.curves.push(...heart(cx, bottom, height * 0.92, Math.min(cw * 0.86, height * 1.05)));
        }
        else
        {
            const r = Math.min(cw, height) * 0.42;
            model.curves.push({points: circle(cx, bottom + height / 2, r), radius: SCROLL, closed: true});
        }
    }
};

const rosetteCurves = (cx: number, cy: number, r: number): Curve[] =>
    buildRosette().paths
        .filter(path => path.kind !== 'diamond')
        .map(path => ({
            points: path.points.map(([x, y]) => [cx + x * r, cy + y * r] as Vec2),
            radius: path.kind === 'ring' ? 0.011 : 0.007,
            closed: path.closed,
        }));

const collar = (model: IronworkModel, x: number, y: number, segments: Interval[]) =>
{
    if (!segments.some(([a, b]) => y > a + 0.03 && y < b - 0.03)) return;
    model.accents.push(bar([x, y - 0.014], [x, y + 0.014], 0.03, 0.03));
};

const finial = (model: IronworkModel, has: (o: Ornament) => boolean, x: number, top: number) =>
{
    if (has('spears'))
    {
        model.bars.push(bar([x, top], [x, top + SPEAR_H * 0.6], PICKET));
        model.tips.push({at: [x, top + SPEAR_H * 0.6], size: 0.035});
    }
    else if (has('balls'))
    {
        model.bars.push(bar([x, top], [x, top + 0.03], PICKET));
        model.balls.push({at: [x, top + 0.03 + BALL_R * 0.8], size: BALL_R});
    }
};

const finialHeight = (design: Design) =>
    design.style === 'modern' || design.style === 'laser' ? 0 : design.ornaments.includes('spears') ? SPEAR_H * 0.6 + 0.035 : design.ornaments.includes('balls') ? 0.03 + BALL_R * 1.8 : 0;

const buildPanel = (design: Design, panel: Panel, model: IronworkModel, topAt: TopFn | null) =>
{
    const {x0, x1, y0, y1} = panel;
    const has    = (o: Ornament) => design.ornaments.includes(o);
    const width  = x1 - x0;
    const height = y1 - y0;
    const inner  = {x0: x0 + FRAME / 2, x1: x1 - FRAME / 2, y0: y0 + FRAME / 2, y1: y1 - FRAME / 2};
    const twist  = has('twisted');

    model.bars.push(
        bar([x0, y0], [x1, y0], FRAME), bar([x0, y1], [x1, y1], FRAME),
        bar([x0, y0], [x0, y1], FRAME), bar([x1, y0], [x1, y1], FRAME),
    );

    const pitch   = design.style === 'baroque' ? 0.105 : 0.125;
    const columns = divide(inner.x0, inner.x1, pitch);

    if (design.style === 'laser')
    {
        model.laser.push({x0: inner.x0 + 0.004, x1: inner.x1 - 0.004, y0: inner.y0 + 0.004, y1: inner.y1 - 0.004});
        if (topAt) addArch(model, panel, columns, topAt, false);
        return;
    }

    const plateH = has('plate') ? Math.min(0.32, height * 0.17) : 0;
    if (plateH) model.bars.push(bar([inner.x0, inner.y0 + plateH / 2], [inner.x1, inner.y0 + plateH / 2], plateH, 0.01));

    const lowRail = plateH ? inner.y0 + plateH : height > 1.2 ? y0 + 0.32 : null;

    const motifs = bandMotifsOf(design);
    const bandH  = Math.min(0.22, height * 0.2);
    const bands: {motif: BandMotif; at: Interval}[] = [];
    if (motifs.length) bands.push({motif: motifs[0], at: [inner.y1 - bandH, inner.y1]});
    const lowMotif = motifs[1] ?? (design.style === 'baroque' ? motifs[0] : undefined);
    if (lowMotif && height > 1)
    {
        const start = (lowRail ?? inner.y0) + RAIL / 2;
        bands.push({motif: lowMotif, at: [start, start + bandH]});
    }

    const freeBottom = bands[1]?.at[1] ?? lowRail ?? inner.y0;
    const freeTop    = bands[0]?.at[0] ?? inner.y1;
    const rosetteR   = Math.min(0.24, width * 0.26, (freeTop - freeBottom) * 0.38);
    const rosette    = has('rosette') && rosetteR > 0.06 ? {cx: (x0 + x1) / 2, cy: (freeBottom + freeTop) / 2, r: rosetteR} : null;
    if (rosette) model.curves.push(...rosetteCurves(rosette.cx, rosette.cy, rosette.r));

    const blocked: Interval[] = [...bands.map(b => b.at), ...(plateH ? [[inner.y0, inner.y0 + plateH] as Interval] : [])];

    if (design.style === 'modern')
    {
        for (const y of divide(inner.y0, inner.y1, 0.11))
            if (!blocked.some(([a, b]) => y > a - 0.03 && y < b + 0.03)) model.bars.push(bar([inner.x0, y], [inner.x1, y], 0.05, 0.012));
    }
    else
    {
        if (lowRail) model.bars.push(bar([inner.x0, lowRail], [inner.x1, lowRail], RAIL));

        for (const x of columns)
        {
            const segments = freeSegments(x, inner.y0, inner.y1, blocked, rosette);
            for (const [a, b] of segments) model.bars.push(bar([x, a], [x, b], PICKET, PICKET, twist));

            if (has('collars'))
            {
                collar(model, x, freeBottom + (freeTop - freeBottom) * 0.72, segments);
                if (lowRail) collar(model, x, lowRail + 0.07, segments);
            }
        }
    }

    for (const {motif, at: [bottom, top]} of bands) band(model, motif, inner.x0, inner.x1, bottom, top - bottom);

    if (topAt) addArch(model, panel, columns, topAt, twist);

    if (design.style !== 'modern')
        for (const x of columns) finial(model, has, x, topAt ? topAt(x) : y1);
};

const addArch = (model: IronworkModel, {x0, x1, y1}: Panel, columns: number[], topAt: TopFn, twist: boolean) =>
{
    const steps  = 32;
    const points = Array.from({length: steps + 1}, (_, i) =>
    {
        const x = x0 + ((x1 - x0) * i) / steps;
        return [x, topAt(x)] as Vec2;
    });
    model.curves.push({points, radius: FRAME / 2, closed: false});
    model.bars.push(bar([x0, y1], [x0, topAt(x0)], FRAME), bar([x1, y1], [x1, topAt(x1)], FRAME));
    for (const x of columns) if (topAt(x) - y1 > 0.03) model.bars.push(bar([x, y1], [x, topAt(x)], PICKET, PICKET, twist));
};

const archFn = (x0: number, x1: number, y1: number): TopFn =>
{
    const half = (x1 - x0) / 2;
    const mid  = (x0 + x1) / 2;
    const rise = Math.min(0.4, half * 0.32);
    return x => y1 + rise * (1 - ((x - mid) / half) ** 2);
};

const buildRailing = (design: Design, model: IronworkModel) =>
{
    const L     = design.widthCm / 100;
    const H     = design.heightCm / 100;
    const x0    = -L / 2;
    const segs  = Math.max(1, Math.ceil(L / 1.5));
    const seg   = L / segs;
    const has   = (o: Ornament) => design.ornaments.includes(o);
    const low   = 0.08;
    const twist = has('twisted');

    model.bars.push(bar([x0 - 0.02, H], [x0 + L + 0.02, H], 0.045, 0.06));
    model.bars.push(bar([x0, low], [x0 + L, low], RAIL));

    for (let s = 0; s <= segs; s++)
    {
        const x = x0 + seg * s;
        model.bars.push(bar([x, 0], [x, H], 0.05));
        if (has('spears')) model.tips.push({at: [x, H + 0.03], size: 0.04});
        else if (has('balls')) model.balls.push({at: [x, H + 0.045], size: 0.03});
    }

    const motif = bandMotifsOf(design)[0];

    for (let s = 0; s < segs; s++)
    {
        const a = x0 + seg * s + 0.025;
        const b = x0 + seg * (s + 1) - 0.025;

        if (design.style === 'laser')
        {
            const sub = H - 0.14;
            model.bars.push(bar([a, sub], [b, sub], RAIL));
            model.laser.push({x0: a + 0.004, x1: b - 0.004, y0: low + RAIL / 2 + 0.002, y1: sub - RAIL / 2 - 0.002});
            continue;
        }

        const bandH   = 0.15;
        const bandAt: Interval | null = motif ? [H - 0.0225 - bandH, H - 0.0225] : null;
        const rosette = has('rosette') ? {cx: (a + b) / 2, cy: (low + (bandAt?.[0] ?? H)) / 2, r: Math.min(0.15, ((bandAt?.[0] ?? H) - low) * 0.38)} : null;
        if (rosette) model.curves.push(...rosetteCurves(rosette.cx, rosette.cy, rosette.r));

        const pitch   = design.style === 'baroque' ? 0.1 : 0.115;
        const columns = divide(a, b, pitch);
        const blocked = bandAt ? [bandAt] : [];

        if (design.style === 'modern')
        {
            for (const y of divide(low, H, 0.12))
                if (!blocked.some(([y0, y1]) => y > y0 - 0.03 && y < y1 + 0.03)) model.bars.push(bar([a, y], [b, y], 0.04, 0.012));
        }
        else
        {
            for (const x of columns)
            {
                const segments = freeSegments(x, low, H, blocked, rosette);
                for (const [y0, y1] of segments) model.bars.push(bar([x, y0], [x, y1], PICKET, PICKET, twist));
                if (has('collars')) collar(model, x, low + 0.12, segments);
            }
        }

        if (motif && bandAt) band(model, motif, a, b, bandAt[0], bandAt[1] - bandAt[0]);
    }

    model.width  = L + 0.04;
    model.height = H + (has('spears') ? 0.07 : has('balls') ? 0.08 : 0);
};

export const buildIronwork = (design: Design): IronworkModel =>
{
    const model: IronworkModel = {bars: [], curves: [], tips: [], balls: [], accents: [], laser: [], width: 0, height: 0};

    if (design.type === 'railing')
    {
        buildRailing(design, model);
        return model;
    }

    const W      = design.widthCm / 100;
    const H      = design.heightCm / 100;
    const ground = design.type === 'window' ? 0 : 0.04;
    const x0     = -W / 2;
    const x1     = W / 2;
    const arch   = design.ornaments.includes('arch') ? archFn(x0, x1, H) : null;

    const leaves: Panel[] = design.type === 'gate' && W > 1.8
        ? [{x0, x1: -0.006, y0: ground, y1: H}, {x0: 0.006, x1, y0: ground, y1: H}]
        : [{x0, x1, y0: ground, y1: H}];

    leaves.forEach(leaf => buildPanel(design, leaf, model, arch));

    let extraWidth = 0;
    if (design.type === 'gate')
    {
        const postTop = H + 0.12;
        model.bars.push(bar([x0 - POST / 2 - 0.01, 0], [x0 - POST / 2 - 0.01, postTop], POST, POST));
        model.bars.push(bar([x1 + POST / 2 + 0.01, 0], [x1 + POST / 2 + 0.01, postTop], POST, POST));
        model.bars.push(bar([x0 - POST - 0.025, postTop], [x0 + 0.005, postTop], POST + 0.03, POST + 0.03));
        model.bars.push(bar([x1 - 0.005, postTop], [x1 + POST + 0.025, postTop], POST + 0.03, POST + 0.03));
        extraWidth = POST * 2 + 0.06 + (design.extras.includes('motor') ? 0.5 : 0);

        if (design.extras.includes('motor'))
            model.bars.push(bar([x1 + POST + 0.2, 0], [x1 + POST + 0.2, 0.26], 0.26, 0.2));
    }

    if (design.type !== 'window')
    {
        const edge = design.type === 'gate' && leaves.length === 2 ? -0.05 : x1 - 0.09;
        model.bars.push(bar([edge, 1.0], [edge + 0.03, 1.0], 0.025, 0.07));
        if (design.extras.includes('lock')) model.bars.push(bar([edge, 0.88], [edge, 0.98], 0.07, 0.05));
    }

    const crown  = arch ? arch(0) : H;
    model.width  = W + extraWidth;
    model.height = Math.max(crown + finialHeight(design), design.type === 'gate' ? H + 0.17 : 0);

    return model;
};
