import type {Design} from '@/lib/configurator';

// Geometría paramétrica de los muebles del configurador, en metros. Función pura:
// del diseño salen formas simples (cajas, cilindros, tubos, aros) con el material que
// les toca. Origen en el piso, centrado; los muebles se ven en perspectiva (3/4).
//
// Referencias: las mesas nido de colores, el butaco de patas en horquilla y la
// poltrona hecha con un tanque de combustible, todos vendidos por el taller.

export type Vec3 = [number, number, number];

// frame: estructura (acabado metálico o color pintado) · accent: parte pintada con
// patrón (tablero, asiento, tanque, radios, maceta) · cushion: tela del cojín o vela ·
// plant: hojas de la planta · glass: vidrio del farol
export type MaterialKey = 'frame' | 'accent' | 'cushion' | 'plant' | 'glass';

interface ShapeBase
{
    material:  MaterialKey;
    position?: Vec3;
    rotation?: Vec3;
}

export type Shape =
    | ShapeBase & {kind: 'box'; size: Vec3}
    | ShapeBase & {kind: 'cylinder'; radius: number; height: number; thetaStart?: number; thetaLength?: number; openEnded?: boolean; radiusTop?: number; segments?: number}
    | ShapeBase & {kind: 'sphere'; radius: number}
    | ShapeBase & {kind: 'tube'; points: Vec3[]; radius: number}
    | ShapeBase & {kind: 'torus'; radius: number; tube: number}
    | ShapeBase & {kind: 'surface'; positions: number[]; indices: number[]}; // malla a medida (espaldar recortado)

export interface FurnitureModel
{
    shapes: Shape[];
    width:  number;
    depth:  number;
    height: number;
}

const TUBE = 0.02; // tubo cuadrado de la estructura

// ─── Mesas nido: tres mesas cuadradas que encajan una dentro de otra ─────────
// Abiertas por delante para poder guardarse; los tableros llevan la pintura.
const nestTable = (shapes: Shape[], w: number, h: number, offset: Vec3) =>
{
    const [ox, , oz] = offset;
    const half = w / 2 - TUBE / 2;
    const at   = (x: number, y: number, z: number): Vec3 => [ox + x, y, oz + z];

    // Tablero y su marco
    shapes.push({kind: 'box', material: 'accent', position: at(0, h - 0.014, 0), size: [w - 0.01, 0.022, w - 0.01]});
    shapes.push(
        {kind: 'box', material: 'frame', position: at(0, h - 0.035, half), size: [w, TUBE, TUBE]},
        {kind: 'box', material: 'frame', position: at(0, h - 0.035, -half), size: [w, TUBE, TUBE]},
        {kind: 'box', material: 'frame', position: at(half, h - 0.035, 0), size: [TUBE, TUBE, w]},
        {kind: 'box', material: 'frame', position: at(-half, h - 0.035, 0), size: [TUBE, TUBE, w]},
    );

    // Patas y patines laterales (el frente queda libre para encajar la mesa menor)
    for (const sx of [-1, 1])
    {
        for (const sz of [-1, 1])
            shapes.push({kind: 'box', material: 'frame', position: at(sx * half, (h - 0.045) / 2, sz * half), size: [TUBE, h - 0.045, TUBE]});
        shapes.push({kind: 'box', material: 'frame', position: at(sx * half, TUBE / 2, 0), size: [TUBE, TUBE, w]});
    }
    shapes.push({kind: 'box', material: 'frame', position: at(0, TUBE / 2, -half), size: [w, TUBE, TUBE]});
};

const buildNest = (design: Design): FurnitureModel =>
{
    const W = design.widthCm / 100;
    const H = design.heightCm / 100;
    const shapes: Shape[] = [];

    // La mayor atrás; las menores salen en diagonal hacia el frente, como en la foto
    const tables = [{s: 1, h: 1}, {s: 0.84, h: 0.88}, {s: 0.68, h: 0.76}];
    tables.forEach(({s, h}, i) => nestTable(shapes, W * s, H * h, [-i * W * 0.2, 0, i * W * 0.26]));

    return {shapes, width: W * 1.45, depth: W * 1.55, height: H};
};

// ─── Butaco: asiento redondo pintado, aro y tres patas en horquilla ──────────
const buildStool = (design: Design): FurnitureModel =>
{
    const R      = design.widthCm / 200;
    const H      = design.heightCm / 100;
    const ringY  = H - 0.03;
    const shapes: Shape[] = [];

    shapes.push({kind: 'cylinder', material: 'accent', position: [0, H - 0.016, 0], radius: R - 0.004, height: 0.032});
    shapes.push({kind: 'torus', material: 'frame', position: [0, ringY, 0], rotation: [Math.PI / 2, 0, 0], radius: R + 0.004, tube: 0.008});

    // Cada horquilla: dos varillas que bajan desde el aro, se abren un poco y se
    // unen abajo en una U
    const polar = (angle: number, radius: number, y: number): Vec3 => [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
    for (let k = 0; k < 3; k++)
    {
        const center = (k / 3) * Math.PI * 2 + Math.PI / 2;
        const spreadTop = 0.32;
        const spreadLow = 0.07;
        const foot      = R * 1.18;
        shapes.push({
            kind: 'tube', material: 'frame', radius: 0.0065,
            points: [
                polar(center - spreadTop, R + 0.004, ringY),
                polar(center - spreadTop * 0.55, R * 1.08, H * 0.55),
                polar(center - spreadLow, foot, 0.06),
                polar(center, foot * 1.01, 0.012),
                polar(center + spreadLow, foot, 0.06),
                polar(center + spreadTop * 0.55, R * 1.08, H * 0.55),
                polar(center + spreadTop, R + 0.004, ringY),
            ],
        });
    }

    return {shapes, width: R * 2.6, depth: R * 2.6, height: H};
};

// ─── Muebles de tanque reciclado ─────────────────────────────────────────────
// Tanques de 55 galones: 58 cm de diámetro, con aros de refuerzo y uniones soldadas.
const DRUM_R = 0.29;

// Arco de aro o unión sobre un tambor horizontal (eje X), solo en la parte que existe.
// En CylinderGeometry rotada al eje X, el ángulo θ apunta a (y, z) = (-sen θ, cos θ).
const drumArc = (x: number, cy: number, r: number, thetaLength: number): Vec3[] =>
    Array.from({length: 49}, (_, i) =>
    {
        const theta = (i / 48) * thetaLength;
        return [x, cy - Math.sin(theta) * r, Math.cos(theta) * r];
    });

const ring = (y: number, r: number, tube: number): Shape =>
    ({kind: 'torus', material: 'accent', position: [0, y, 0], rotation: [Math.PI / 2, 0, 0], radius: r, tube});

// Poltrona: tanque vertical. Abajo el tambor completo con sus aros; arriba el espaldar,
// que baja en diagonal hacia el frente, con esquinas redondeadas y agarradera recortada.
const buildBarrelChair = (): FurnitureModel =>
{
    const R      = DRUM_R;
    const feet   = 0.03;
    const seatY  = 0.46;
    const topY   = 0.88;
    const shapes: Shape[] = [];

    // Cuerpo bajo, fondo y base del asiento
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, (feet + seatY) / 2, 0], radius: R, height: seatY - feet, openEnded: true});
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, feet + 0.005, 0], radius: R, height: 0.01});
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, seatY - 0.005, 0], radius: R - 0.004, height: 0.01});

    // Rebordes y aros del tambor
    shapes.push(ring(feet + 0.008, R + 0.006, 0.008), ring(seatY, R + 0.006, 0.008));
    shapes.push(ring(feet + (seatY - feet) * 0.36, R + 0.004, 0.005), ring(feet + (seatY - feet) * 0.7, R + 0.004, 0.005));

    // Espaldar: superficie curva sobre el tambor, alta atrás y baja adelante
    const half  = Math.PI * 0.62;                 // abre ±112° desde la espalda
    const cols  = 240;
    const rows  = 64;
    const rise  = topY - seatY;
    const profile = (u: number) =>
        u <= 0.4 ? 1
            : u <= 0.6 ? 1 - (1 - Math.cos(((u - 0.4) / 0.2) * (Math.PI / 2))) * 0.28
                : 0.72 - ((u - 0.6) / 0.4) * 0.66;
    const angleAt  = (i: number) => Math.PI - half + (2 * half * i) / cols;
    const heightAt = (i: number) => seatY + rise * profile(Math.abs(angleAt(i) - Math.PI) / half);

    // Agarradera: rectángulo redondeado recortado arriba en la espalda
    const handleW = 0.11;               // semiancho 11 cm
    const handleH = 0.055;              // semialto 5,5 cm
    const handleY = seatY + rise * 0.7;
    const inHandle = (angle: number, y: number) =>
    {
        const dx = Math.abs(angle - Math.PI) * R / handleW;
        const dy = Math.abs(y - handleY) / handleH;
        return dx ** 4 + dy ** 4 < 1;
    };

    const positions: number[] = [];
    const indices:   number[] = [];
    for (let i = 0; i <= cols; i++)
    {
        const angle = angleAt(i);
        const top   = heightAt(i);
        for (let j = 0; j <= rows; j++)
        {
            const y = seatY + ((top - seatY) * j) / rows;
            positions.push(Math.sin(angle) * R, y, Math.cos(angle) * R);
        }
    }
    for (let i = 0; i < cols; i++)
    {
        for (let j = 0; j < rows; j++)
        {
            const a = i * (rows + 1) + j;
            const b = a + rows + 1;
            const centerAngle = (angleAt(i) + angleAt(i + 1)) / 2;
            const centerY     = seatY + ((heightAt(i) - seatY) * (j + 0.5)) / rows;
            if (inHandle(centerAngle, centerY)) continue;
            indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
    }
    shapes.push({kind: 'surface', material: 'accent', positions, indices});

    // Borde enrollado del espaldar
    shapes.push({
        kind: 'tube', material: 'accent', radius: 0.006,
        points: Array.from({length: cols / 4 + 1}, (_, k) =>
        {
            const i = k * 4;
            return [Math.sin(angleAt(i)) * R, heightAt(i), Math.cos(angleAt(i)) * R] as Vec3;
        }),
    });

    // Reborde de la agarradera (superelipse sobre el tambor): esconde el corte
    shapes.push({
        kind: 'tube', material: 'accent', radius: 0.005,
        points: Array.from({length: 65}, (_, k) =>
        {
            const t     = (k / 64) * Math.PI * 2;
            const sx    = Math.sign(Math.cos(t)) * Math.abs(Math.cos(t)) ** 0.5;
            const sy    = Math.sign(Math.sin(t)) * Math.abs(Math.sin(t)) ** 0.5;
            const angle = Math.PI + (sx * handleW) / R;
            return [Math.sin(angle) * (R + 0.002), handleY + sy * handleH, Math.cos(angle) * (R + 0.002)] as Vec3;
        }),
    });

    // Cojín redondo y patas cortas
    shapes.push({kind: 'cylinder', material: 'cushion', position: [0, seatY + 0.045, 0], radius: R - 0.025, height: 0.08});
    for (let k = 0; k < 4; k++)
    {
        const angle = (k / 4) * Math.PI * 2 + Math.PI / 4;
        shapes.push({kind: 'box', material: 'frame', position: [Math.cos(angle) * R * 0.78, feet / 2, Math.sin(angle) * R * 0.78], size: [0.03, feet, 0.03]});
    }

    return {shapes, width: R * 2.3, depth: R * 2.3, height: topY};
};

// Sofá: tanque horizontal sin el cuarto delantero de arriba. La pared trasera hace de
// espaldar, las tapas de apoyabrazos y el cojín queda a la altura del eje.
const buildDrumSofa = (design: Design): FurnitureModel =>
{
    const L      = design.widthCm / 100;
    const R      = DRUM_R;
    const legs   = 0.09;
    const cy     = legs + R;
    // La pared va del frente, por abajo y atrás, hasta arriba-atrás: el borde superior
    // queda detrás de los cojines del espaldar, sin curvarse sobre ellos
    const shell  = 1.5 * Math.PI - 0.5;
    const axisX: Vec3 = [0, 0, -Math.PI / 2];
    const drums  = L > 2 ? 3 : 2;
    const seats  = drums;
    const shapes: Shape[] = [];

    shapes.push({kind: 'cylinder', material: 'accent', position: [0, cy, 0], rotation: axisX, radius: R, height: L, openEnded: true, thetaStart: 0, thetaLength: shell});

    // Tapas completas a los lados: apoyabrazos
    for (const sx of [-1, 1])
        shapes.push({kind: 'cylinder', material: 'accent', position: [sx * (L / 2), cy, 0], rotation: axisX, radius: R + 0.004, height: 0.014});

    // Uniones soldadas entre tambores y aros de refuerzo de cada uno (terminan un poco
    // antes del borde para no asomar por encima)
    const drumL = L / drums;
    for (let d = 0; d < drums; d++)
    {
        const x0 = -L / 2 + d * drumL;
        if (d > 0) shapes.push({kind: 'tube', material: 'accent', radius: 0.008, points: drumArc(x0, cy, R + 0.006, shell - 0.06)});
        for (const f of [1 / 3, 2 / 3])
            shapes.push({kind: 'tube', material: 'accent', radius: 0.005, points: drumArc(x0 + drumL * f, cy, R + 0.004, shell - 0.06)});
    }

    // Cojines: uno largo de asiento y uno de espalda por puesto
    shapes.push({kind: 'box', material: 'cushion', position: [0, cy + 0.05, 0.03], size: [L - 0.05, 0.12, R * 1.5]});
    const seatW = (L - 0.12) / seats;
    for (let i = 0; i < seats; i++)
    {
        const x = -L / 2 + 0.06 + seatW * (i + 0.5);
        // Recostado sobre el borde del tambor y sobresaliendo por encima, como en el sofá
        // real: ahí apoya la espalda. La cara trasera toca el borde sin atravesarlo.
        shapes.push({kind: 'box', material: 'cushion', position: [x, cy + 0.27, -0.087], size: [seatW - 0.05, 0.42, 0.12], rotation: [-0.3, 0, 0]});
    }

    // Patas en trapecio de platina: en los extremos y en cada unión
    const zc = R * 0.42;
    const yc = cy - Math.sqrt(R ** 2 - zc ** 2);
    const zf = R * 0.72;
    const legXs = [-L / 2 + 0.12, ...Array.from({length: drums - 1}, (_, d) => -L / 2 + (d + 1) * drumL), L / 2 - 0.12];
    for (const x of legXs)
        shapes.push({kind: 'tube', material: 'frame', radius: 0.011, points: [[x, yc, -zc], [x, 0.012, -zf], [x, 0.012, zf], [x, yc, zc]]});

    return {shapes, width: L + 0.04, depth: R * 2.2, height: cy + R};
};

const buildArmchair = (design: Design): FurnitureModel =>
    design.size === 'small' ? buildBarrelChair() : buildDrumSofa(design);

// ─── Iluminación y decoración ────────────────────────────────────────────────
const polar = (angle: number, radius: number, y: number): Vec3 => [Math.cos(angle) * radius, y, Math.sin(angle) * radius];

// Cadena: tubo delgado entre dos puntos (a esta distancia no se distinguen eslabones)
const chain = (a: Vec3, b: Vec3): Shape => ({kind: 'tube', material: 'frame', radius: 0.0035, points: [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], b]});

// Lámpara de rueda (la de la foto del taller): aro plano, radios de madera pintada,
// brazos en S con portavelas, argollas colgando y tres cadenas a una corona
const buildChandelier = (design: Design): FurnitureModel =>
{
    const D     = design.widthCm / 100;
    const H     = design.heightCm / 100;
    const R     = D / 2;
    const arms  = design.size === 'small' ? 4 : design.size === 'large' ? 8 : 6;
    const ringY = 0.3;
    const shapes: Shape[] = [];

    // Aro plano y cubo central
    shapes.push({kind: 'cylinder', material: 'frame', position: [0, ringY, 0], radius: R, height: 0.045, openEnded: true, segments: 72});
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, ringY, 0], radius: 0.045, height: 0.07});

    // Radios de madera
    for (let i = 0; i < arms; i++)
    {
        const a = (i / arms) * Math.PI * 2;
        shapes.push({kind: 'box', material: 'accent', position: polar(a, R / 2, ringY), rotation: [0, -a, 0], size: [R - 0.04, 0.03, 0.035]});
    }

    // Brazos: voluta en S en el plano radial, con portavela arriba y argolla abajo
    for (let i = 0; i < arms; i++)
    {
        const a = (i / arms) * Math.PI * 2 + Math.PI / arms;
        const at = (u: number, v: number): Vec3 => polar(a, R + u, ringY + v);
        shapes.push({kind: 'tube', material: 'frame', radius: 0.008, points: [at(0, 0), at(0.05, 0.03), at(0.085, 0.1), at(0.07, 0.17), at(0.04, 0.165), at(0.035, 0.13)]});
        shapes.push({kind: 'tube', material: 'frame', radius: 0.008, points: [at(0, 0), at(0.045, -0.04), at(0.055, -0.1), at(0.03, -0.125), at(0.015, -0.1)]});
        // Portavela, vela y argolla
        shapes.push({kind: 'cylinder', material: 'frame', position: at(0.075, 0.19), radius: 0.035, height: 0.012});
        shapes.push({kind: 'cylinder', material: 'cushion', position: at(0.075, 0.23), radius: 0.014, height: 0.07});
        shapes.push({kind: 'torus', material: 'frame', position: at(0.03, -0.155), rotation: [0, -a + Math.PI / 2, 0], radius: 0.02, tube: 0.004});
    }

    // Cadenas a la corona y de la corona al techo
    const crownY = ringY + Math.min(0.45, H * 0.45);
    shapes.push({kind: 'torus', material: 'frame', position: [0, crownY, 0], rotation: [Math.PI / 2, 0, 0], radius: 0.07, tube: 0.008});
    for (let k = 0; k < 3; k++)
    {
        const a = (k / 3) * Math.PI * 2;
        shapes.push(chain(polar(a, R - 0.01, ringY + 0.02), polar(a, 0.065, crownY)));
    }
    shapes.push(chain([0, crownY, 0], [0, H - 0.02, 0]));
    shapes.push({kind: 'cylinder', material: 'frame', position: [0, H - 0.01, 0], radius: 0.06, height: 0.02});

    return {shapes, width: D + 0.3, depth: D + 0.3, height: H};
};

// Farol colgante (diseño nuevo): caja de vidrio con aristas de hierro, techo
// piramidal pintado, remate de bola y argolla con cadena
const buildLantern = (design: Design): FurnitureModel =>
{
    const W     = design.widthCm / 100;
    const H     = design.heightCm / 100;
    const body  = W * 1.4;
    const baseY = 0.05;
    const topY  = baseY + body;
    const half  = W / 2;
    const bar   = 0.012;
    const shapes: Shape[] = [];

    // Bandeja inferior y marco superior
    shapes.push({kind: 'box', material: 'frame', position: [0, baseY, 0], size: [W + 0.03, 0.02, W + 0.03]});
    shapes.push({kind: 'box', material: 'frame', position: [0, topY, 0], size: [W + 0.01, 0.015, W + 0.01]});

    // Aristas verticales, travesaño medio y vidrios
    for (const sx of [-1, 1])
        for (const sz of [-1, 1])
            shapes.push({kind: 'box', material: 'frame', position: [sx * half, baseY + body / 2, sz * half], size: [bar, body, bar]});
    for (const [rot, off] of [[0, half], [0, -half], [Math.PI / 2, half], [Math.PI / 2, -half]] as const)
    {
        const position: Vec3 = rot === 0 ? [0, baseY + body / 2, off] : [off, baseY + body / 2, 0];
        shapes.push({kind: 'box', material: 'glass', position, rotation: [0, rot, 0], size: [W - bar, body - 0.02, 0.004]});
        shapes.push({kind: 'box', material: 'frame', position: rot === 0 ? [0, baseY + body * 0.7, off] : [off, baseY + body * 0.7, 0], rotation: [0, rot, 0], size: [W, 0.01, 0.008]});
    }

    // Bombillo tipo vela adentro
    shapes.push({kind: 'cylinder', material: 'cushion', position: [0, baseY + 0.06, 0], radius: 0.02, height: 0.08});

    // Techo piramidal (cono de 4 lados) y remate
    const roofH = W * 0.55;
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, topY + roofH / 2, 0], rotation: [0, Math.PI / 4, 0], radius: half * 1.55, radiusTop: 0.012, height: roofH, segments: 4});
    shapes.push({kind: 'sphere', material: 'frame', position: [0, topY + roofH + 0.015, 0], radius: 0.018});

    // Argolla y cadena al techo
    const ringY = topY + roofH + 0.05;
    shapes.push({kind: 'torus', material: 'frame', position: [0, ringY, 0], radius: 0.025, tube: 0.005});
    shapes.push(chain([0, ringY + 0.025, 0], [0, H - 0.02, 0]));
    shapes.push({kind: 'cylinder', material: 'frame', position: [0, H - 0.01, 0], radius: 0.05, height: 0.02});

    return {shapes, width: W * 1.9, depth: W * 1.9, height: H};
};

// Planta en su maceta: un puñado de hojas (esferas aplastadas) sobre la tierra
const potted = (shapes: Shape[], x: number, y: number, z: number, r: number, h: number) =>
{
    shapes.push({kind: 'cylinder', material: 'accent', position: [x, y + h / 2, z], radius: r, radiusTop: r * 1.18, height: h});
    const leaves: [number, number, number, number][] = [[0, 1.35, 0, 0.75], [0.45, 1.15, 0.2, 0.55], [-0.45, 1.1, -0.15, 0.6], [0.15, 1.05, -0.5, 0.5], [-0.2, 1.2, 0.45, 0.5]];
    for (const [dx, dy, dz, s] of leaves)
        shapes.push({kind: 'sphere', material: 'plant', position: [x + dx * r, y + h * dy + r * 0.3, z + dz * r], radius: r * s});
};

// Rueda en el plano XY: llanta de platina, radios y cubo
const wheel = (shapes: Shape[], x: number, r: number, spokes: number) =>
{
    const cy = r + 0.02;
    shapes.push({kind: 'torus', material: 'frame', position: [x, cy, 0], radius: r, tube: 0.008});
    shapes.push({kind: 'cylinder', material: 'frame', position: [x, cy, 0], rotation: [Math.PI / 2, 0, 0], radius: 0.022, height: 0.05});
    for (let i = 0; i < spokes; i++)
    {
        const a = (i / spokes) * Math.PI;
        shapes.push({kind: 'box', material: 'frame', position: [x, cy, 0], rotation: [0, 0, a], size: [r * 2, 0.005, 0.005]});
    }
    // Pata de platina en cruz bajo la rueda
    shapes.push({kind: 'box', material: 'frame', position: [x, 0.005, 0], size: [0.05, 0.01, r * 1.1]});
    shapes.push({kind: 'box', material: 'frame', position: [x, 0.005, 0], size: [r * 0.9, 0.01, 0.04]});
    return cy;
};

// Matera bicicleta (la de la foto del taller): rueda grande adelante, pequeña atrás,
// cuadro curvo, manubrio, canasta delantera y portamatera atrás con su planta
const buildBicycle = (design: Design): FurnitureModel =>
{
    const k = design.widthCm / 100;
    const shapes: Shape[] = [];
    const tube = (points: Vec3[], radius = 0.016): Shape => ({kind: 'tube', material: 'frame', radius, points});

    const frontX = 0.22 * k;
    const rearX  = -0.4 * k;
    const frontR = 0.34 * k;
    const rearR  = 0.15 * k;
    const fy     = wheel(shapes, frontX, frontR, 6);
    const ry     = wheel(shapes, rearX, rearR, 4);

    // Cuadro: del eje trasero sube en curva hasta el tubo de dirección
    const headTop: Vec3 = [frontX - 0.02 * k, fy + 0.45 * k, 0];
    shapes.push(tube([[rearX, ry, 0], [rearX + 0.08 * k, ry + 0.22 * k, 0], [-0.12 * k, fy + 0.3 * k, 0], [frontX - 0.12 * k, fy + 0.34 * k, 0], headTop]));
    // Horquilla al eje delantero y tubo de dirección al manubrio
    shapes.push(tube([headTop, [frontX - 0.005, fy + 0.2 * k, 0], [frontX, fy, 0]]));
    const barY = fy + 0.62 * k;
    shapes.push(tube([headTop, [frontX - 0.02 * k, barY - 0.05 * k, 0]]));
    for (const z of [-0.11 * k, 0.11 * k])
        shapes.push(tube([[frontX - 0.02 * k, barY - 0.05 * k, 0], [frontX - 0.02 * k, barY - 0.04 * k, z], [frontX - 0.03 * k, barY + 0.12 * k, z], [frontX - 0.1 * k, barY + 0.16 * k, z]], 0.013));

    // Sillín
    shapes.push(tube([[-0.18 * k, fy + 0.31 * k, 0], [-0.18 * k, fy + 0.4 * k, 0]], 0.012));
    shapes.push({kind: 'cylinder', material: 'frame', position: [-0.18 * k, fy + 0.41 * k, 0], radius: 0.07 * k, height: 0.015});

    // Pedales
    for (const z of [-0.06, 0.06])
        shapes.push({kind: 'box', material: 'frame', position: [frontX, fy - 0.05 * k, z * k], size: [0.08 * k, 0.012, 0.05 * k]});

    // Canasta delantera de alambre
    const bx0 = frontX - 0.04 * k;
    const bx1 = frontX + 0.3 * k;
    const by  = fy + 0.36 * k;
    const bz  = 0.16 * k;
    const wire = (a: Vec3, b: Vec3): Shape => ({kind: 'tube', material: 'frame', radius: 0.005, points: [a, b]});
    for (const y of [by, by + 0.1 * k, by + 0.18 * k])
    {
        const corners: Vec3[] = [[bx0, y, -bz], [bx1, y, -bz], [bx1, y, bz], [bx0, y, bz], [bx0, y, -bz]];
        shapes.push({kind: 'tube', material: 'frame', radius: 0.005, points: corners});
    }
    for (const [x, z] of [[bx0, -bz], [bx1, -bz], [bx1, bz], [bx0, bz]] as const) shapes.push(wire([x, by, z], [x, by + 0.18 * k, z]));
    shapes.push({kind: 'box', material: 'frame', position: [(bx0 + bx1) / 2, by, 0], size: [bx1 - bx0, 0.006, bz * 2]});
    shapes.push(tube([[frontX - 0.01 * k, fy + 0.25 * k, 0], [frontX + 0.05 * k, by, 0]], 0.01));

    // Portamatera trasero con planta
    const px0 = rearX - 0.16 * k;
    const px1 = rearX + 0.14 * k;
    const py  = ry + 0.33 * k;
    const pz  = 0.13 * k;
    shapes.push({kind: 'tube', material: 'frame', radius: 0.005, points: [[px0, py, -pz], [px1, py, -pz], [px1, py, pz], [px0, py, pz], [px0, py, -pz]]});
    shapes.push({kind: 'box', material: 'frame', position: [(px0 + px1) / 2, py - 0.004, 0], size: [px1 - px0, 0.006, pz * 2]});
    shapes.push(tube([[rearX, ry, 0], [rearX + 0.02 * k, py, 0]], 0.01));
    potted(shapes, (px0 + px1) / 2, py, 0, 0.09 * k, 0.12 * k);

    return {shapes, width: 0.95 * k + 0.1, depth: 0.5 * k, height: barY + 0.18 * k};
};

// Escalera de materas (diseño nuevo): tres aros en diagonal sobre patas de varilla,
// con una voluta bajo cada aro y su planta
const buildTiered = (design: Design): FurnitureModel =>
{
    const W = design.widthCm / 100;
    const H = design.heightCm / 100;
    const shapes: Shape[] = [];
    const levels = [
        {x: -W * 0.32, y: H * 0.32},
        {x: 0,         y: H * 0.58},
        {x: W * 0.32,  y: H * 0.84},
    ];
    const ringR = W * 0.16;

    // Base: dos platinas en el piso a lo largo
    for (const z of [-ringR * 0.8, ringR * 0.8])
        shapes.push({kind: 'box', material: 'frame', position: [0, 0.006, z], size: [W * 1.05, 0.012, 0.03]});

    for (const level of levels)
    {
        shapes.push({kind: 'torus', material: 'frame', position: [level.x, level.y, 0], rotation: [Math.PI / 2, 0, 0], radius: ringR, tube: 0.007});
        // Dos patas por aro, del piso al aro
        for (const z of [-ringR * 0.8, ringR * 0.8])
            shapes.push({kind: 'tube', material: 'frame', radius: 0.008, points: [[level.x, 0.012, z], [level.x, level.y / 2, z * 0.98], [level.x, level.y, z * 0.75]]});
        // Voluta decorativa bajo el aro
        const vy = level.y - 0.08;
        shapes.push({kind: 'tube', material: 'frame', radius: 0.006, points: [[level.x - ringR * 0.9, level.y - 0.005, 0], [level.x - ringR * 0.6, vy, 0], [level.x - ringR * 0.2, vy - 0.02, 0], [level.x, vy + 0.01, 0], [level.x - ringR * 0.18, vy + 0.04, 0]]});
        shapes.push({kind: 'tube', material: 'frame', radius: 0.006, points: [[level.x + ringR * 0.9, level.y - 0.005, 0], [level.x + ringR * 0.6, vy, 0], [level.x + ringR * 0.2, vy - 0.02, 0], [level.x, vy + 0.01, 0], [level.x + ringR * 0.18, vy + 0.04, 0]]});
        potted(shapes, level.x, level.y - ringR * 0.55, 0, ringR * 0.85, ringR * 0.9);
    }

    // Travesaño que une las patas por detrás
    shapes.push({kind: 'tube', material: 'frame', radius: 0.008, points: levels.map(l => [l.x, l.y * 0.5, -ringR * 0.8] as Vec3)});

    return {shapes, width: W * 1.2, depth: ringR * 3, height: H + ringR};
};

export const buildFurniture = (design: Design): FurnitureModel =>
{
    switch (design.type)
    {
        case 'nest':     return buildNest(design);
        case 'stool':    return buildStool(design);
        case 'armchair': return buildArmchair(design);
        case 'chandelier': return buildChandelier(design);
        case 'lantern':  return buildLantern(design);
        case 'bicycle':  return buildBicycle(design);
        case 'tiered':   return buildTiered(design);
        default:         return {shapes: [], width: 1, depth: 1, height: 1};
    }
};
