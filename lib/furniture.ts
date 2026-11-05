import type {Design} from '@/lib/configurator';

export type Vec3 = [number, number, number];

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
    | ShapeBase & {kind: 'surface'; positions: number[]; indices: number[]};

export interface FurnitureModel
{
    shapes: Shape[];
    width:  number;
    depth:  number;
    height: number;
}

const TUBE = 0.02;

const nestTable = (shapes: Shape[], w: number, h: number, offset: Vec3) =>
{
    const [ox, , oz] = offset;
    const half = w / 2 - TUBE / 2;
    const at   = (x: number, y: number, z: number): Vec3 => [ox + x, y, oz + z];

    shapes.push({kind: 'box', material: 'accent', position: at(0, h - 0.014, 0), size: [w - 0.01, 0.022, w - 0.01]});
    shapes.push(
        {kind: 'box', material: 'frame', position: at(0, h - 0.035, half), size: [w, TUBE, TUBE]},
        {kind: 'box', material: 'frame', position: at(0, h - 0.035, -half), size: [w, TUBE, TUBE]},
        {kind: 'box', material: 'frame', position: at(half, h - 0.035, 0), size: [TUBE, TUBE, w]},
        {kind: 'box', material: 'frame', position: at(-half, h - 0.035, 0), size: [TUBE, TUBE, w]},
    );

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

    const tables = [{s: 1, h: 1}, {s: 0.84, h: 0.88}, {s: 0.68, h: 0.76}];
    tables.forEach(({s, h}, i) => nestTable(shapes, W * s, H * h, [-i * W * 0.2, 0, i * W * 0.26]));

    return {shapes, width: W * 1.45, depth: W * 1.55, height: H};
};

const buildStool = (design: Design): FurnitureModel =>
{
    const R      = design.widthCm / 200;
    const H      = design.heightCm / 100;
    const ringY  = H - 0.03;
    const shapes: Shape[] = [];

    shapes.push({kind: 'cylinder', material: 'accent', position: [0, H - 0.016, 0], radius: R - 0.004, height: 0.032});
    shapes.push({kind: 'torus', material: 'frame', position: [0, ringY, 0], rotation: [Math.PI / 2, 0, 0], radius: R + 0.004, tube: 0.008});

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

const DRUM_R = 0.29;

const drumArc = (x: number, cy: number, r: number, thetaLength: number): Vec3[] =>
    Array.from({length: 49}, (_, i) =>
    {
        const theta = (i / 48) * thetaLength;
        return [x, cy - Math.sin(theta) * r, Math.cos(theta) * r];
    });

const ring = (y: number, r: number, tube: number): Shape =>
    ({kind: 'torus', material: 'accent', position: [0, y, 0], rotation: [Math.PI / 2, 0, 0], radius: r, tube});

const buildBarrelChair = (): FurnitureModel =>
{
    const R      = DRUM_R;
    const feet   = 0.03;
    const seatY  = 0.46;
    const topY   = 0.88;
    const shapes: Shape[] = [];

    shapes.push({kind: 'cylinder', material: 'accent', position: [0, (feet + seatY) / 2, 0], radius: R, height: seatY - feet, openEnded: true});
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, feet + 0.005, 0], radius: R, height: 0.01});
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, seatY - 0.005, 0], radius: R - 0.004, height: 0.01});

    shapes.push(ring(feet + 0.008, R + 0.006, 0.008), ring(seatY, R + 0.006, 0.008));
    shapes.push(ring(feet + (seatY - feet) * 0.36, R + 0.004, 0.005), ring(feet + (seatY - feet) * 0.7, R + 0.004, 0.005));

    const half  = Math.PI * 0.62;
    const cols  = 240;
    const rows  = 64;
    const rise  = topY - seatY;
    const profile = (u: number) =>
        u <= 0.4 ? 1
            : u <= 0.6 ? 1 - (1 - Math.cos(((u - 0.4) / 0.2) * (Math.PI / 2))) * 0.28
                : 0.72 - ((u - 0.6) / 0.4) * 0.66;
    const angleAt  = (i: number) => Math.PI - half + (2 * half * i) / cols;
    const heightAt = (i: number) => seatY + rise * profile(Math.abs(angleAt(i) - Math.PI) / half);

    const handleW = 0.11;
    const handleH = 0.055;
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

    shapes.push({
        kind: 'tube', material: 'accent', radius: 0.006,
        points: Array.from({length: cols / 4 + 1}, (_, k) =>
        {
            const i = k * 4;
            return [Math.sin(angleAt(i)) * R, heightAt(i), Math.cos(angleAt(i)) * R] as Vec3;
        }),
    });

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

    shapes.push({kind: 'cylinder', material: 'cushion', position: [0, seatY + 0.045, 0], radius: R - 0.025, height: 0.08});
    for (let k = 0; k < 4; k++)
    {
        const angle = (k / 4) * Math.PI * 2 + Math.PI / 4;
        shapes.push({kind: 'box', material: 'frame', position: [Math.cos(angle) * R * 0.78, feet / 2, Math.sin(angle) * R * 0.78], size: [0.03, feet, 0.03]});
    }

    return {shapes, width: R * 2.3, depth: R * 2.3, height: topY};
};

const buildDrumSofa = (design: Design): FurnitureModel =>
{
    const L      = design.widthCm / 100;
    const R      = DRUM_R;
    const legs   = 0.09;
    const cy     = legs + R;
    const shell  = 1.5 * Math.PI - 0.5;
    const axisX: Vec3 = [0, 0, -Math.PI / 2];
    const drums  = L > 2 ? 3 : 2;
    const seats  = drums;
    const shapes: Shape[] = [];

    shapes.push({kind: 'cylinder', material: 'accent', position: [0, cy, 0], rotation: axisX, radius: R, height: L, openEnded: true, thetaStart: 0, thetaLength: shell});

    for (const sx of [-1, 1])
        shapes.push({kind: 'cylinder', material: 'accent', position: [sx * (L / 2), cy, 0], rotation: axisX, radius: R + 0.004, height: 0.014});

    const drumL = L / drums;
    for (let d = 0; d < drums; d++)
    {
        const x0 = -L / 2 + d * drumL;
        if (d > 0) shapes.push({kind: 'tube', material: 'accent', radius: 0.008, points: drumArc(x0, cy, R + 0.006, shell - 0.06)});
        for (const f of [1 / 3, 2 / 3])
            shapes.push({kind: 'tube', material: 'accent', radius: 0.005, points: drumArc(x0 + drumL * f, cy, R + 0.004, shell - 0.06)});
    }

    shapes.push({kind: 'box', material: 'cushion', position: [0, cy + 0.05, 0.03], size: [L - 0.05, 0.12, R * 1.5]});
    const seatW = (L - 0.12) / seats;
    for (let i = 0; i < seats; i++)
    {
        const x = -L / 2 + 0.06 + seatW * (i + 0.5);
        shapes.push({kind: 'box', material: 'cushion', position: [x, cy + 0.27, -0.087], size: [seatW - 0.05, 0.42, 0.12], rotation: [-0.3, 0, 0]});
    }

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

const polar = (angle: number, radius: number, y: number): Vec3 => [Math.cos(angle) * radius, y, Math.sin(angle) * radius];

const chain = (a: Vec3, b: Vec3): Shape => ({kind: 'tube', material: 'frame', radius: 0.0035, points: [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], b]});

const buildChandelier = (design: Design): FurnitureModel =>
{
    const D     = design.widthCm / 100;
    const H     = design.heightCm / 100;
    const R     = D / 2;
    const arms  = design.size === 'small' ? 4 : design.size === 'large' ? 8 : 6;
    const ringY = 0.3;
    const shapes: Shape[] = [];

    shapes.push({kind: 'cylinder', material: 'frame', position: [0, ringY, 0], radius: R, height: 0.045, openEnded: true, segments: 72});
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, ringY, 0], radius: 0.045, height: 0.07});

    for (let i = 0; i < arms; i++)
    {
        const a = (i / arms) * Math.PI * 2;
        shapes.push({kind: 'box', material: 'accent', position: polar(a, R / 2, ringY), rotation: [0, -a, 0], size: [R - 0.04, 0.03, 0.035]});
    }

    for (let i = 0; i < arms; i++)
    {
        const a = (i / arms) * Math.PI * 2 + Math.PI / arms;
        const at = (u: number, v: number): Vec3 => polar(a, R + u, ringY + v);
        shapes.push({kind: 'tube', material: 'frame', radius: 0.008, points: [at(0, 0), at(0.05, 0.03), at(0.085, 0.1), at(0.07, 0.17), at(0.04, 0.165), at(0.035, 0.13)]});
        shapes.push({kind: 'tube', material: 'frame', radius: 0.008, points: [at(0, 0), at(0.045, -0.04), at(0.055, -0.1), at(0.03, -0.125), at(0.015, -0.1)]});
        shapes.push({kind: 'cylinder', material: 'frame', position: at(0.075, 0.19), radius: 0.035, height: 0.012});
        shapes.push({kind: 'cylinder', material: 'cushion', position: at(0.075, 0.23), radius: 0.014, height: 0.07});
        shapes.push({kind: 'torus', material: 'frame', position: at(0.03, -0.155), rotation: [0, -a + Math.PI / 2, 0], radius: 0.02, tube: 0.004});
    }

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

    shapes.push({kind: 'box', material: 'frame', position: [0, baseY, 0], size: [W + 0.03, 0.02, W + 0.03]});
    shapes.push({kind: 'box', material: 'frame', position: [0, topY, 0], size: [W + 0.01, 0.015, W + 0.01]});

    for (const sx of [-1, 1])
        for (const sz of [-1, 1])
            shapes.push({kind: 'box', material: 'frame', position: [sx * half, baseY + body / 2, sz * half], size: [bar, body, bar]});
    for (const [rot, off] of [[0, half], [0, -half], [Math.PI / 2, half], [Math.PI / 2, -half]] as const)
    {
        const position: Vec3 = rot === 0 ? [0, baseY + body / 2, off] : [off, baseY + body / 2, 0];
        shapes.push({kind: 'box', material: 'glass', position, rotation: [0, rot, 0], size: [W - bar, body - 0.02, 0.004]});
        shapes.push({kind: 'box', material: 'frame', position: rot === 0 ? [0, baseY + body * 0.7, off] : [off, baseY + body * 0.7, 0], rotation: [0, rot, 0], size: [W, 0.01, 0.008]});
    }

    shapes.push({kind: 'cylinder', material: 'cushion', position: [0, baseY + 0.06, 0], radius: 0.02, height: 0.08});

    const roofH = W * 0.55;
    shapes.push({kind: 'cylinder', material: 'accent', position: [0, topY + roofH / 2, 0], rotation: [0, Math.PI / 4, 0], radius: half * 1.55, radiusTop: 0.012, height: roofH, segments: 4});
    shapes.push({kind: 'sphere', material: 'frame', position: [0, topY + roofH + 0.015, 0], radius: 0.018});

    const ringY = topY + roofH + 0.05;
    shapes.push({kind: 'torus', material: 'frame', position: [0, ringY, 0], radius: 0.025, tube: 0.005});
    shapes.push(chain([0, ringY + 0.025, 0], [0, H - 0.02, 0]));
    shapes.push({kind: 'cylinder', material: 'frame', position: [0, H - 0.01, 0], radius: 0.05, height: 0.02});

    return {shapes, width: W * 1.9, depth: W * 1.9, height: H};
};

const potted = (shapes: Shape[], x: number, y: number, z: number, r: number, h: number) =>
{
    shapes.push({kind: 'cylinder', material: 'accent', position: [x, y + h / 2, z], radius: r, radiusTop: r * 1.18, height: h});
    const leaves: [number, number, number, number][] = [[0, 1.35, 0, 0.75], [0.45, 1.15, 0.2, 0.55], [-0.45, 1.1, -0.15, 0.6], [0.15, 1.05, -0.5, 0.5], [-0.2, 1.2, 0.45, 0.5]];
    for (const [dx, dy, dz, s] of leaves)
        shapes.push({kind: 'sphere', material: 'plant', position: [x + dx * r, y + h * dy + r * 0.3, z + dz * r], radius: r * s});
};

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
    shapes.push({kind: 'box', material: 'frame', position: [x, 0.005, 0], size: [0.05, 0.01, r * 1.1]});
    shapes.push({kind: 'box', material: 'frame', position: [x, 0.005, 0], size: [r * 0.9, 0.01, 0.04]});
    return cy;
};

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

    const headTop: Vec3 = [frontX - 0.02 * k, fy + 0.45 * k, 0];
    shapes.push(tube([[rearX, ry, 0], [rearX + 0.08 * k, ry + 0.22 * k, 0], [-0.12 * k, fy + 0.3 * k, 0], [frontX - 0.12 * k, fy + 0.34 * k, 0], headTop]));
    shapes.push(tube([headTop, [frontX - 0.005, fy + 0.2 * k, 0], [frontX, fy, 0]]));
    const barY = fy + 0.62 * k;
    shapes.push(tube([headTop, [frontX - 0.02 * k, barY - 0.05 * k, 0]]));
    for (const z of [-0.11 * k, 0.11 * k])
        shapes.push(tube([[frontX - 0.02 * k, barY - 0.05 * k, 0], [frontX - 0.02 * k, barY - 0.04 * k, z], [frontX - 0.03 * k, barY + 0.12 * k, z], [frontX - 0.1 * k, barY + 0.16 * k, z]], 0.013));

    shapes.push(tube([[-0.18 * k, fy + 0.31 * k, 0], [-0.18 * k, fy + 0.4 * k, 0]], 0.012));
    shapes.push({kind: 'cylinder', material: 'frame', position: [-0.18 * k, fy + 0.41 * k, 0], radius: 0.07 * k, height: 0.015});

    for (const z of [-0.06, 0.06])
        shapes.push({kind: 'box', material: 'frame', position: [frontX, fy - 0.05 * k, z * k], size: [0.08 * k, 0.012, 0.05 * k]});

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

    for (const z of [-ringR * 0.8, ringR * 0.8])
        shapes.push({kind: 'box', material: 'frame', position: [0, 0.006, z], size: [W * 1.05, 0.012, 0.03]});

    for (const level of levels)
    {
        shapes.push({kind: 'torus', material: 'frame', position: [level.x, level.y, 0], rotation: [Math.PI / 2, 0, 0], radius: ringR, tube: 0.007});
        for (const z of [-ringR * 0.8, ringR * 0.8])
            shapes.push({kind: 'tube', material: 'frame', radius: 0.008, points: [[level.x, 0.012, z], [level.x, level.y / 2, z * 0.98], [level.x, level.y, z * 0.75]]});
        const vy = level.y - 0.08;
        shapes.push({kind: 'tube', material: 'frame', radius: 0.006, points: [[level.x - ringR * 0.9, level.y - 0.005, 0], [level.x - ringR * 0.6, vy, 0], [level.x - ringR * 0.2, vy - 0.02, 0], [level.x, vy + 0.01, 0], [level.x - ringR * 0.18, vy + 0.04, 0]]});
        shapes.push({kind: 'tube', material: 'frame', radius: 0.006, points: [[level.x + ringR * 0.9, level.y - 0.005, 0], [level.x + ringR * 0.6, vy, 0], [level.x + ringR * 0.2, vy - 0.02, 0], [level.x, vy + 0.01, 0], [level.x + ringR * 0.18, vy + 0.04, 0]]});
        potted(shapes, level.x, level.y - ringR * 0.55, 0, ringR * 0.85, ringR * 0.9);
    }

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
