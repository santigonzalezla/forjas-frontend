import {CanvasTexture, RepeatWrapping, SRGBColorSpace} from 'three';
import {MIX, findColor, type PaletteId} from '@/lib/palette';
import type {Pattern} from '@/lib/configurator';

// Texturas pintadas para tableros, asientos y tanques, dibujadas en un <canvas>:
// - solid:   un solo color
// - stripes: tablillas de colores con junta oscura (mesas nido de colores)
// - art:     manchas de color con contorno negro, pintadas a mano (butaco)
// Se generan con una semilla fija: el mismo diseño siempre se ve igual.

const SIZE = 512;

// Generador pseudoaleatorio con semilla (mulberry32)
const seeded = (seed: number) => () =>
{
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash = (text: string) => Array.from(text).reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

export const createPatternTexture = (pattern: Pattern, accent: PaletteId): CanvasTexture =>
{
    const canvas  = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx     = canvas.getContext('2d')!;
    const random  = seeded(hash(`${pattern}-${accent}`));
    const pick    = () => findColor(MIX[Math.floor(random() * MIX.length)]).hex;

    ctx.fillStyle = findColor(accent).hex;
    ctx.fillRect(0, 0, SIZE, SIZE);

    if (pattern === 'stripes')
    {
        // Tablillas de ancho parejo, partidas en tramos de distinto color
        const rows = 8;
        const rowH = SIZE / rows;
        for (let r = 0; r < rows; r++)
        {
            let x = 0;
            while (x < SIZE)
            {
                const w = SIZE * (0.25 + random() * 0.45);
                ctx.fillStyle = pick();
                ctx.fillRect(x, r * rowH, w, rowH);
                x += w;
            }
        }
        ctx.strokeStyle = 'rgba(20, 20, 20, 0.75)';
        ctx.lineWidth   = 5;
        for (let r = 1; r < rows; r++)
        {
            ctx.beginPath();
            ctx.moveTo(0, r * rowH);
            ctx.lineTo(SIZE, r * rowH);
            ctx.stroke();
        }
    }
    else if (pattern === 'art')
    {
        // Manchas superpuestas con contorno, como vitral pintado a mano
        for (let i = 0; i < 16; i++)
        {
            ctx.beginPath();
            ctx.ellipse(random() * SIZE, random() * SIZE, 40 + random() * 150, 30 + random() * 110, random() * Math.PI, 0, Math.PI * 2);
            ctx.fillStyle   = pick();
            ctx.fill();
            ctx.lineWidth   = 7;
            ctx.strokeStyle = '#1a1a1a';
            ctx.stroke();
        }
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
};

// Tela estampada para cojines: rombos de colores sobre fondo claro, como los cojines
// de la poltrona morada
export const createFabricTexture = (): CanvasTexture =>
{
    const canvas  = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx     = canvas.getContext('2d')!;
    const colors  = ['azul', 'turquesa', 'verde', 'amarillo', 'celeste'] as const;
    const random  = seeded(hash('fabric'));

    ctx.fillStyle = '#f7f5ef';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const step = SIZE / 5;
    for (let row = 0; row < 6; row++)
    {
        for (let col = 0; col < 6; col++)
        {
            const cx = col * step + (row % 2 ? step / 2 : 0);
            const cy = row * step;
            const r  = step * 0.36;
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r, cy);
            ctx.lineTo(cx, cy + r);
            ctx.lineTo(cx - r, cy);
            ctx.closePath();
            ctx.fillStyle = findColor(colors[Math.floor(random() * colors.length)]).hex;
            ctx.fill();
        }
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
};
