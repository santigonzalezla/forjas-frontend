
export type Point = [number, number];

export type RosetteKind = 'ring' | 'bar' | 'lobe' | 'scroll' | 'diamond';

export interface RosettePath
{
    kind:   RosetteKind;
    points: Point[];
    closed: boolean;
}

export interface RosetteGeometry
{
    paths:   RosettePath[];
    collars: Point[];
}

const DIRECTIONS = [Math.PI / 2, 0, -Math.PI / 2, Math.PI];

const toWorld = (theta: number, a: number, b: number): Point =>
{
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return [a * cos - b * sin, a * sin + b * cos];
};

const cubicBezier = (p0: Point, p1: Point, p2: Point, p3: Point, steps: number): Point[] =>
{
    const points: Point[] = [];

    for (let i = 0; i <= steps; i++)
    {
        const t  = i / steps;
        const mt = 1 - t;
        points.push([
            mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0],
            mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1],
        ]);
    }

    return points;
};

const spiral = (center: Point, r0: number, r1: number, startAngle: number, turns: number, steps: number): Point[] =>
{
    const points: Point[] = [];

    for (let i = 0; i <= steps; i++)
    {
        const t     = i / steps;
        const angle = startAngle + t * turns * Math.PI * 2;
        const r     = r0 + (r1 - r0) * t;
        points.push([center[0] + Math.cos(angle) * r, center[1] + Math.sin(angle) * r]);
    }

    return points;
};

export const buildRosette = (): RosetteGeometry =>
{
    const paths:   RosettePath[] = [];
    const collars: Point[]       = [];

    paths.push({
        kind:   'ring',
        points: spiral([0, 0], 1, 1, 0, 1, 120).slice(0, -1),
        closed: true,
    });

    for (const theta of DIRECTIONS)
    {
        const at = (a: number, b: number) => toWorld(theta, a, b);

        paths.push({kind: 'bar', points: [at(0.13, 0), at(0.85, 0)], closed: false});

        paths.push({
            kind:   'diamond',
            points: [at(0.83, 0), at(0.9, 0.05), at(0.97, 0), at(0.9, -0.05)],
            closed: true,
        });

        paths.push({
            kind:   'diamond',
            points: [at(0.08, 0), at(0.135, 0.04), at(0.19, 0), at(0.135, -0.04)],
            closed: true,
        });

        for (const side of [1, -1])
        {
            const lobe = cubicBezier([0.26, 0], [0.36, 0.34 * side], [0.98, 0.44 * side], [0.76, 0.02 * side], 48)
                .map(([a, b]) => at(a, b));
            paths.push({kind: 'lobe', points: lobe, closed: false});

            const curl = spiral([0.6, 0.17 * side], 0.1, 0.022, side > 0 ? -Math.PI / 2 : Math.PI / 2, 1.2 * side, 48)
                .map(([a, b]) => at(a, b));
            paths.push({kind: 'scroll', points: curl, closed: false});
        }

        collars.push(at(0.26, 0), at(0.76, 0));
    }

    return {paths, collars};
};

export const toSvgPath = ({points, closed}: RosettePath): string =>
{
    const [first, ...rest] = points;
    const d = `M${first[0].toFixed(4)} ${(-first[1]).toFixed(4)} ` +
        rest.map(([x, y]) => `L${x.toFixed(4)} ${(-y).toFixed(4)}`).join(' ');
    return closed ? `${d} Z` : d;
};
