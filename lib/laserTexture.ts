import {CanvasTexture, LinearFilter, RepeatWrapping} from 'three';
import type {LaserMotif} from '@/lib/configurator';

// Diseños de corte láser como mapa de transparencia: blanco = lámina, negro = calado.
// Son mosaicos que se repiten sin costura (cada figura se dibuja también desplazada
// un mosaico en cada dirección), así la lámina puede tener cualquier medida.
//
// Follaje: ramas curvas con hojas en gota, como las barandas instaladas por el taller.

// Metros de lámina que cubre un mosaico, según el diseño: la enredadera es amplia para
// que no se note la repetición
export const LASER_TILES: Record<LaserMotif, number> = {foliage: 0.75, vines: 1.3, lattice: 0.8, geometric: 0.75, waves: 0.75};

const SIZE = 1024;

const seeded = (seed: number) => () =>
{
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Dibuja una figura en sus nueve posiciones del mosaico para que no se corte en los bordes
const tiled = (draw: (dx: number, dy: number) => void) =>
{
    for (const dx of [-SIZE, 0, SIZE])
        for (const dy of [-SIZE, 0, SIZE])
            draw(dx, dy);
};

// Hoja en gota: punta hacia la rama y bulbo redondo afuera, con una leve curva
const drop = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, width: number, bend: number) =>
{
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const bulb = length * 0.7;
    const r    = width / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(length * 0.28, -r * 0.2 + bend, length * 0.45, -r + bend * 0.5, bulb, -r);
    ctx.arc(bulb, 0, r, -Math.PI / 2, Math.PI / 2);
    ctx.bezierCurveTo(length * 0.45, r + bend * 0.5, length * 0.28, r * 0.2 + bend, 0, 0);
    ctx.fill();
    ctx.restore();
};

const drawFoliage = (ctx: CanvasRenderingContext2D) =>
{
    const random = seeded(1997);

    // Cada gota ocupa un círculo aproximado; ninguna puede tocar a otra (distancia
    // medida sobre el mosaico, que se repite) para que siempre quede una vena de lámina
    const placed: {x: number; y: number; r: number}[] = [];
    const vein = SIZE * 0.022;
    const wrap = (d: number) => Math.min(Math.abs(d), SIZE - Math.abs(d));
    const fits = (x: number, y: number, r: number) =>
        placed.every(p => Math.hypot(wrap(x - p.x), wrap(y - p.y)) > r + p.r + vein);

    const place = (x: number, y: number, angle: number, length: number, bend: number) =>
    {
        // Si no cabe, se intenta más pequeña antes de descartarla
        for (const scale of [1, 0.8, 0.62])
        {
            const l  = length * scale;
            const cx = (((x + Math.cos(angle) * l * 0.55) % SIZE) + SIZE) % SIZE;
            const cy = (((y + Math.sin(angle) * l * 0.55) % SIZE) + SIZE) % SIZE;
            const r  = l * 0.36;
            if (!fits(cx, cy, r)) continue;
            placed.push({x: cx, y: cy, r});
            tiled((dx, dy) => drop(ctx, x + dx, y + dy, angle, l, l * 0.46, bend * scale));
            return;
        }
    };

    // Ramas que suben en diagonal y se curvan; de cada una salen gotas a ambos lados
    const branches = [
        {x: 0.05, y: 1.05, angle: -1.05, length: 1.05, sway: 0.18},
        {x: 0.62, y: 1.08, angle: -1.95, length: 1.0,  sway: -0.16},
        {x: 0.98, y: 0.62, angle: -2.55, length: 0.7,  sway: 0.14},
        {x: 0.28, y: 0.5,  angle: -0.55, length: 0.62, sway: -0.12},
    ];

    for (const branch of branches)
    {
        const steps = 9;
        for (let k = 1; k <= steps; k++)
        {
            const t     = k / (steps + 1);
            const along = branch.length * t * SIZE;
            const swayT = Math.sin(t * Math.PI) * branch.sway * SIZE;
            const dir   = branch.angle + Math.sin(t * Math.PI * 1.3) * 0.4;
            const px    = branch.x * SIZE + Math.cos(branch.angle) * along - Math.sin(branch.angle) * swayT;
            const py    = branch.y * SIZE + Math.sin(branch.angle) * along + Math.cos(branch.angle) * swayT;
            const size  = (1 - t * 0.45) * SIZE * (0.24 + random() * 0.05);
            const side  = k % 2 === 0 ? 1 : -1;
            const angle = dir + side * (0.6 + random() * 0.35);
            const gap   = SIZE * 0.02; // vena entre la rama y la gota

            place(px + Math.cos(angle) * gap, py + Math.sin(angle) * gap, angle, size, side * size * 0.12);
        }
    }

    // Gotas sueltas que llenan los huecos que quedaron
    for (let i = 0; i < 60; i++)
        place(random() * SIZE, random() * SIZE, random() * Math.PI * 2, SIZE * (0.1 + random() * 0.08), SIZE * 0.012);
};

// Hoja almendrada al final de un tallito
const leaf = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number) =>
{
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.5, -length * 0.32, length, 0);
    ctx.quadraticCurveTo(length * 0.5, length * 0.32, 0, 0);
    ctx.fill();
    ctx.restore();
};

// Enredadera (como el portón calado del taller): tallos delgados que serpentean y se
// enrollan en espiral, con hojas almendradas a lado y lado. El calado son los tallos
// y las hojas; la lámina es el fondo.
const drawVines = (ctx: CanvasRenderingContext2D) =>
{
    const random = seeded(2016);
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';

    const vine = (startX: number, startY: number, heading: number, steps: number, width: number, depth: number) =>
    {
        const points: [number, number][] = [[startX, startY]];
        let x = startX;
        let y = startY;
        let a = heading;
        let turn = (random() < 0.5 ? -1 : 1) * (0.035 + random() * 0.05);
        const stepLength = SIZE * 0.01;

        for (let i = 0; i < steps; i++)
        {
            // Curvatura que cambia de sentido de vez en cuando: el tallo serpentea
            if (i % 16 === 0) turn = (random() < 0.5 ? -1 : 1) * (0.035 + random() * 0.05);
            a += turn;
            x += Math.cos(a) * stepLength;
            y += Math.sin(a) * stepLength;
            points.push([x, y]);
        }

        // Remate en espiral al final del tallo
        const curlDir = turn >= 0 ? 1 : -1;
        let r = SIZE * 0.06;
        for (let i = 0; i < 34; i++)
        {
            a += curlDir * 0.3;
            r *= 0.94;
            x += Math.cos(a) * r * 0.32;
            y += Math.sin(a) * r * 0.32;
            points.push([x, y]);
        }

        tiled((dx, dy) =>
        {
            ctx.lineWidth = width;
            ctx.beginPath();
            points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px + dx, py + dy) : ctx.lineTo(px + dx, py + dy)));
            ctx.stroke();
        });

        // Hojas en pares alternados a lo largo del tallo, y algún brote secundario
        for (let i = 5; i < steps; i += 6)
        {
            const [px, py] = points[i];
            const [nx, ny] = points[i + 1];
            const along    = Math.atan2(ny - py, nx - px);
            const side     = Math.round(i / 6) % 2 ? 1 : -1;
            const angle    = along + side * (0.65 + random() * 0.4);
            const length   = SIZE * (0.04 + random() * 0.025);
            tiled((dx, dy) => leaf(ctx, px + dx, py + dy, angle, length));

            if (depth > 0 && random() < 0.22)
                vine(px, py, along + side * 0.9, 18 + Math.floor(random() * 16), width * 0.7, depth - 1);
        }
    };

    for (let k = 0; k < 6; k++)
        vine(random() * SIZE, random() * SIZE, random() * Math.PI * 2, 60 + Math.floor(random() * 40), SIZE * 0.009, 1);
};

// Celosía árabe: tréboles de cuatro hojas en cuadrícula; la lámina forma la trama
const drawLattice = (ctx: CanvasRenderingContext2D) =>
{
    const cells = 5;
    const step  = SIZE / cells;
    const lobe  = step * 0.2;
    const off   = step * 0.17;

    const quatrefoil = (cx: number, cy: number) =>
    {
        ctx.beginPath();
        for (const [dx, dy] of [[0, -off], [off, 0], [0, off], [-off, 0]])
        {
            ctx.moveTo(cx + dx + lobe, cy + dy);
            ctx.arc(cx + dx, cy + dy, lobe, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.fillRect(cx - off, cy - off, off * 2, off * 2);
    };

    for (let row = 0; row <= cells; row++)
        for (let col = 0; col <= cells; col++)
        {
            quatrefoil(col * step + step / 2, row * step + step / 2);
            // Rombo pequeño en cada cruce de la trama
            const x = col * step;
            const y = row * step;
            const d = step * 0.07;
            ctx.beginPath();
            ctx.moveTo(x, y - d);
            ctx.lineTo(x + d, y);
            ctx.lineTo(x, y + d);
            ctx.lineTo(x - d, y);
            ctx.closePath();
            ctx.fill();
        }
};

const drawGeometric = (ctx: CanvasRenderingContext2D) =>
{
    const step = SIZE / 6;
    for (let row = 0; row < 6; row++)
    {
        for (let col = 0; col < 6; col++)
        {
            const cx = col * step + step / 2;
            const cy = row * step + step / 2;
            const r  = step * 0.36;
            // Rombo grande calado
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r, cy);
            ctx.lineTo(cx, cy + r);
            ctx.lineTo(cx - r, cy);
            ctx.closePath();
            ctx.fill();
            // Cuadro pequeño en la esquina entre rombos
            const q = step * 0.09;
            ctx.fillRect(col * step - q, row * step - q, q * 2, q * 2);
        }
    }
    // Esquinas del mosaico (para que el borde repita igual)
    const q = step * 0.09;
    for (const x of [SIZE]) for (let row = 0; row <= 6; row++) ctx.fillRect(x - q, row * step - q, q * 2, q * 2);
    for (let col = 0; col <= 6; col++) ctx.fillRect(col * step - q, SIZE - q, q * 2, q * 2);
};

const drawWaves = (ctx: CanvasRenderingContext2D) =>
{
    const rows = 7;
    ctx.lineCap   = 'round';
    ctx.lineWidth = SIZE * 0.055;
    for (let r = 0; r < rows; r++)
    {
        const base  = (r + 0.5) * (SIZE / rows);
        const phase = r % 2 ? Math.PI : 0;
        tiled((dx, dy) =>
        {
            ctx.beginPath();
            for (let x = 0; x <= SIZE; x += 8)
            {
                const y = base + Math.sin((x / SIZE) * Math.PI * 4 + phase) * SIZE * 0.035;
                if (x === 0) ctx.moveTo(x + dx, y + dy);
                else ctx.lineTo(x + dx, y + dy);
            }
            ctx.stroke();
        });
    }
};

export const createLaserTexture = (motif: LaserMotif): CanvasTexture =>
{
    const canvas  = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx     = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle   = '#000000';
    ctx.strokeStyle = '#000000';

    if (motif === 'foliage') drawFoliage(ctx);
    else if (motif === 'vines') drawVines(ctx);
    else if (motif === 'lattice') drawLattice(ctx);
    else if (motif === 'geometric') drawGeometric(ctx);
    else drawWaves(ctx);

    const texture = new CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.minFilter = LinearFilter;
    return texture;
};
