'use client';

import {useCallback, useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {ContactShadows, Environment, Lightformer, Line, PresentationControls} from '@react-three/drei';
import {BoxGeometry, BufferAttribute, BufferGeometry as Geometry, CatmullRomCurve3, CylinderGeometry, PlaneGeometry, type Texture, Color, DoubleSide, InstancedMesh, MathUtils, Matrix4, MeshStandardMaterial, OctahedronGeometry, Quaternion, SphereGeometry, TubeGeometry, Vector3, type BufferGeometry} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {buildIronwork, type Bar, type Rect, type Tip} from '@/lib/ironwork';
import {buildFurniture, type Shape} from '@/lib/furniture';
import {createFabricTexture, createPatternTexture} from '@/lib/patternTexture';
import {LASER_TILES, createLaserTexture} from '@/lib/laserTexture';
import {findFinish, type FinishId} from '@/lib/finishes';
import {findColor} from '@/lib/palette';
import {isFurniture, type Design} from '@/lib/configurator';

interface PieceSceneProps
{
    design:   Design;
    onReady?: () => void;
}

const HOT_COLOR = new Color('#ff5a14');
const TMP_COLOR = new Color();
const Z_AXIS    = new Vector3(0, 0, 1);
const FOV       = 30;

// Pintura de taller sobre metal: poco brillo metálico, satinada
const PAINT = {metalness: 0.2, roughness: 0.5};

// Geometrías unitarias compartidas: cada barra, punta o bola es una instancia escalada
const BOX_GEOMETRY  = new BoxGeometry(1, 1, 1);
const TIP_GEOMETRY  = new OctahedronGeometry(1, 0);
const BALL_GEOMETRY = new SphereGeometry(1, 16, 12);

// Barrote torcido: caja con muchos segmentos a lo largo, girada sobre su eje
const TWIST_GEOMETRY = (() =>
{
    const geometry = new BoxGeometry(1, 1, 1, 64, 1, 1);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++)
    {
        const angle = position.getX(i) * Math.PI * 2 * 6; // seis vueltas a lo largo
        const y = position.getY(i);
        const z = position.getZ(i);
        position.setY(i, y * Math.cos(angle) - z * Math.sin(angle));
        position.setZ(i, y * Math.sin(angle) + z * Math.cos(angle));
    }
    geometry.computeVertexNormals();
    return geometry;
})();

const barMatrix = (bar: Bar, matrix: Matrix4) =>
{
    const dx  = bar.b[0] - bar.a[0];
    const dy  = bar.b[1] - bar.a[1];
    const len = Math.hypot(dx, dy);
    return matrix.compose(
        new Vector3((bar.a[0] + bar.b[0]) / 2, (bar.a[1] + bar.b[1]) / 2, 0),
        new Quaternion().setFromAxisAngle(Z_AXIS, Math.atan2(dy, dx)),
        // Se alarga medio grosor por lado para que las uniones queden cerradas
        new Vector3(len + bar.t, bar.t, bar.d),
    );
};

const tipMatrix = (tip: Tip, matrix: Matrix4) =>
    matrix.compose(new Vector3(tip.at[0], tip.at[1] + tip.size * 0.9, 0), new Quaternion(), new Vector3(tip.size * 0.55, tip.size * 1.1, tip.size * 0.4));

const ballMatrix = (ball: Tip, matrix: Matrix4) =>
    matrix.compose(new Vector3(ball.at[0], ball.at[1], 0), new Quaternion(), new Vector3(ball.size, ball.size, ball.size));

// ─── Materiales compartidos y su animación ───────────────────────────────────
// La estructura sigue el acabado (metal o pintado) y se "recalienta" con cada cambio.
// Las mutaciones por cuadro van por refs, no sobre valores de hooks.
const useFrameMaterial = (design: Design) =>
{
    const material = useMemo(() => new MeshStandardMaterial({emissive: HOT_COLOR, emissiveIntensity: 0, side: DoubleSide}), []);
    const brass    = useMemo(() => new MeshStandardMaterial({color: '#b8913f', metalness: 1, roughness: 0.3}), []);
    // Lámina en corte láser: mismo acabado que la estructura, calada con un mapa de transparencia
    const laser    = useMemo(() => new MeshStandardMaterial({emissive: HOT_COLOR, emissiveIntensity: 0, side: DoubleSide, alphaTest: 0.5}), []);
    const ref      = useRef<MeshStandardMaterial | null>(null);
    const laserRef = useRef<MeshStandardMaterial | null>(null);
    const heat     = useRef(0.9);

    useEffect(() =>
    {
        ref.current      = material;
        laserRef.current = laser;
        return () =>
        {
            material.dispose();
            brass.dispose();
            laser.dispose();
        };
    }, [material, brass, laser]);

    const setLaserPattern = useCallback((map: Texture | null) =>
    {
        const target = laserRef.current;
        if (!target) return;
        target.alphaMap    = map;
        target.needsUpdate = true;
    }, []);

    useFrame((_, delta) =>
    {
        const shared = ref.current;
        if (!shared) return;

        const painted = design.finish === 'pintado';
        const finish  = painted ? null : findFinish(design.finish as FinishId);
        TMP_COLOR.set(painted ? findColor(design.colors.frame).hex : finish!.color);
        shared.color.lerp(TMP_COLOR, 1 - Math.exp(-delta * 6));
        shared.metalness         = MathUtils.damp(shared.metalness, painted ? PAINT.metalness : finish!.metalness, 6, delta);
        shared.roughness         = MathUtils.damp(shared.roughness, painted ? PAINT.roughness : finish!.roughness, 6, delta);
        heat.current             = Math.max(0, heat.current - delta * 0.7);
        shared.emissiveIntensity = heat.current * 2.2;

        const sheet = laserRef.current;
        if (sheet)
        {
            sheet.color.copy(shared.color);
            sheet.metalness         = shared.metalness;
            sheet.roughness         = shared.roughness;
            sheet.emissiveIntensity = shared.emissiveIntensity;
        }
    });

    // Cada cambio de diseño "recalienta" un poco la pieza: se ve qué cambió
    const reheat = useCallback((amount: number) =>
    {
        heat.current = Math.max(heat.current, amount);
    }, []);

    return {material, brass, laser, setLaserPattern, reheat};
};

// ─── Instancias (barras, puntas, bolas) ──────────────────────────────────────
const Instances = <T,>({items, geometry, material, toMatrix}: {items: T[]; geometry: BufferGeometry; material: MeshStandardMaterial; toMatrix: (item: T, m: Matrix4) => Matrix4}) =>
{
    const ref = useRef<InstancedMesh>(null);

    useLayoutEffect(() =>
    {
        const mesh = ref.current;
        if (!mesh) return;
        const matrix = new Matrix4();
        items.forEach((item, i) => mesh.setMatrixAt(i, toMatrix(item, matrix)));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [items, toMatrix]);

    if (items.length === 0) return null;
    // key por cantidad: InstancedMesh no puede crecer, se recrea si cambia el conteo
    return <instancedMesh key={items.length} ref={ref} args={[geometry, material, items.length]} />;
};

// ─── Cámara que encuadra la pieza ────────────────────────────────────────────
// Ornamentación de frente; muebles un poco desde arriba para ver tableros y asientos
const FitCamera = ({width, height, elevated}: {width: number; height: number; elevated: boolean}) =>
{
    // La cámara se lee del estado del cuadro (no de useThree) para poder moverla aquí
    useFrame(({camera, size}, delta) =>
    {
        const tan      = Math.tan(MathUtils.degToRad(FOV / 2));
        const aspect   = size.width / Math.max(1, size.height);
        const margin   = elevated ? 0.25 : 0.5;
        const distance = Math.max((height + margin) / (2 * tan), (width + margin) / (2 * tan * aspect)) * (elevated ? 1.25 : 1.08);
        const targetY  = height / 2;
        const camY     = elevated ? targetY + distance * 0.32 : targetY + 0.1;

        camera.position.x = MathUtils.damp(camera.position.x, 0, 5, delta);
        camera.position.y = MathUtils.damp(camera.position.y, camY, 5, delta);
        camera.position.z = MathUtils.damp(camera.position.z, distance, 5, delta);
        camera.lookAt(0, targetY, 0);
    });

    return null;
};

// Lámina calada: un plano con coordenadas UV en metros, para que el motivo conserve
// su escala sin importar el ancho de la hoja y continúe entre hojas vecinas
const LaserSheet = ({rect, material, tile}: {rect: Rect; material: MeshStandardMaterial; tile: number}) =>
{
    const geometry = useMemo(() =>
    {
        const w = rect.x1 - rect.x0;
        const h = rect.y1 - rect.y0;
        const plane = new PlaneGeometry(w, h);
        const uv = plane.attributes.uv;
        // Coordenadas en metros del mundo: el diseño sigue de una hoja a la otra sin repetirse
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (rect.x0 + uv.getX(i) * w) / tile, (rect.y0 + uv.getY(i) * h) / tile);
        uv.needsUpdate = true;
        return plane;
    }, [rect, tile]);

    useEffect(() => () => geometry.dispose(), [geometry]);

    return <mesh geometry={geometry} material={material} position={[(rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2, 0]} />;
};

// ─── Ornamentación ───────────────────────────────────────────────────────────
const Ornamental = ({design}: {design: Design}) =>
{
    const model = useMemo(() => buildIronwork(design), [design]);
    const {material, brass, laser, setLaserPattern, reheat} = useFrameMaterial(design);

    // Diseño del corte: una textura por motivo, que se repite según el tamaño de cada lámina
    const laserMap = useMemo(() => (design.style === 'laser' ? createLaserTexture(design.laserMotif) : null), [design.style, design.laserMotif]);
    useEffect(() =>
    {
        setLaserPattern(laserMap);
        return () => laserMap?.dispose();
    }, [laserMap, setLaserPattern]);

    const plain   = useMemo(() => model.bars.filter(bar => !bar.twist), [model]);
    const twisted = useMemo(() => model.bars.filter(bar => bar.twist), [model]);

    // Volutas, corazones, anillos, arcos y rosetas: una sola geometría fusionada por diseño
    const curves = useMemo(() =>
    {
        if (model.curves.length === 0) return null;
        const tubes = model.curves.map(curve =>
        {
            const path = new CatmullRomCurve3(curve.points.map(([x, y]) => new Vector3(x, y, 0)), curve.closed, 'centripetal');
            return new TubeGeometry(path, Math.max(16, curve.points.length * 2), curve.radius, 6, curve.closed);
        });
        const merged = mergeGeometries(tubes);
        tubes.forEach(tube => tube.dispose());
        return merged;
    }, [model]);

    useEffect(() => () => curves?.dispose(), [curves]);

    useEffect(() => reheat(0.45), [model, reheat]);

    const labelY = -0.12;
    const labelX = model.width / 2 + 0.16;

    return (
        <group>
            <Instances items={plain} geometry={BOX_GEOMETRY} material={material} toMatrix={barMatrix} />
            <Instances items={twisted} geometry={TWIST_GEOMETRY} material={material} toMatrix={barMatrix} />
            <Instances items={model.tips} geometry={TIP_GEOMETRY} material={material} toMatrix={tipMatrix} />
            <Instances items={model.balls} geometry={BALL_GEOMETRY} material={brass} toMatrix={ballMatrix} />
            <Instances items={model.accents} geometry={BOX_GEOMETRY} material={brass} toMatrix={barMatrix} />
            {curves && <mesh geometry={curves} material={material} />}
            {model.laser.map((rect, i) => <LaserSheet key={`${i}-${rect.x0}-${rect.y0}`} rect={rect} material={laser} tile={LASER_TILES[design.laserMotif]} />)}

            {/* Cotas: ancho abajo y alto a la derecha (el valor se muestra fuera del lienzo) */}
            <Line points={[[-model.width / 2, labelY, 0], [model.width / 2, labelY, 0]]} color="#8a9096" lineWidth={1} />
            <Line points={[[labelX, 0, 0], [labelX, design.heightCm / 100, 0]]} color="#8a9096" lineWidth={1} />

            <FitCamera width={model.width + 0.4} height={model.height + 0.2} elevated={false} />
        </group>
    );
};

// ─── Muebles ─────────────────────────────────────────────────────────────────
// La tela estampada se repite cada TILE metros sin importar el tamaño del cojín:
// se escalan las coordenadas UV de cada cara según sus medidas reales.
const TILE = 0.3;

// Hojas y vidrio no cambian con el diseño: un material compartido para todos
const PLANT = new MeshStandardMaterial({color: '#3f8f45', metalness: 0, roughness: 0.75, flatShading: true});
const GLASS = new MeshStandardMaterial({color: '#e8f1f2', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.28});
const ORIGIN: [number, number, number] = [0, 0, 0];

const scaleGroupUVs = (geometry: Geometry, scales: [number, number][]) =>
{
    const uv    = geometry.attributes.uv;
    const index = geometry.index;
    const done  = new Set<number>();
    geometry.groups.forEach((group, g) =>
    {
        const [su, sv] = scales[g] ?? [1, 1];
        for (let i = group.start; i < group.start + group.count; i++)
        {
            const vertex = index ? index.getX(i) : i;
            if (done.has(vertex)) continue;
            done.add(vertex);
            uv.setXY(vertex, uv.getX(vertex) * su, uv.getY(vertex) * sv);
        }
    });
    uv.needsUpdate = true;
};

const cushionGeometry = (shape: Shape): Geometry | null =>
{
    if (shape.material !== 'cushion') return null;

    if (shape.kind === 'box')
    {
        const [w, h, d] = shape.size;
        const geometry  = new BoxGeometry(w, h, d);
        // Caras: +x, -x, +y, -y, +z, -z
        scaleGroupUVs(geometry, [[d / TILE, h / TILE], [d / TILE, h / TILE], [w / TILE, d / TILE], [w / TILE, d / TILE], [w / TILE, h / TILE], [w / TILE, h / TILE]]);
        return geometry;
    }
    if (shape.kind === 'cylinder')
    {
        const geometry = new CylinderGeometry(shape.radius, shape.radius, shape.height, 56);
        const cap      = (shape.radius * 2) / TILE;
        // Grupos: costado, tapa superior, tapa inferior
        scaleGroupUVs(geometry, [[(Math.PI * 2 * shape.radius) / TILE, shape.height / TILE], [cap, cap], [cap, cap]]);
        return geometry;
    }
    return null;
};
const ShapeMesh = ({shape, material}: {shape: Shape; material: MeshStandardMaterial}) =>
{
    const curve = useMemo(
        () => (shape.kind === 'tube' ? new CatmullRomCurve3(shape.points.map(p => new Vector3(...p)), false, 'centripetal') : null),
        [shape],
    );

    // Malla a medida (espaldar de la poltrona): se arma desde los vértices del modelo
    const surface = useMemo(() =>
    {
        if (shape.kind !== 'surface') return null;
        const geometry = new Geometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(shape.positions), 3));
        geometry.setIndex(shape.indices);
        geometry.computeVertexNormals();
        return geometry;
    }, [shape]);

    const fabric = useMemo(() => cushionGeometry(shape), [shape]);

    useEffect(() => () => surface?.dispose(), [surface]);
    useEffect(() => () => fabric?.dispose(), [fabric]);

    // Posición y rotación siempre explícitas: si faltan, three.js conservaría las anteriores
    const position = shape.position ?? ORIGIN;
    const rotation = shape.rotation ?? ORIGIN;

    if (surface) return <mesh geometry={surface} material={material} position={ORIGIN} rotation={ORIGIN} />;
    if (fabric) return <mesh geometry={fabric} material={material} position={position} rotation={rotation} />;

    return (
        <mesh position={position} rotation={rotation} material={material}>
            {shape.kind === 'box' && <boxGeometry args={shape.size} />}
            {shape.kind === 'cylinder' && <cylinderGeometry args={[shape.radiusTop ?? shape.radius, shape.radius, shape.height, shape.segments ?? 56, 1, shape.openEnded ?? false, shape.thetaStart ?? 0, shape.thetaLength ?? Math.PI * 2]} />}
            {shape.kind === 'sphere' && <sphereGeometry args={[shape.radius, 20, 14]} />}
            {shape.kind === 'torus' && <torusGeometry args={[shape.radius, shape.tube, 12, 72]} />}
            {shape.kind === 'tube' && curve && <tubeGeometry args={[curve, 72, shape.radius, 8, false]} />}
        </mesh>
    );
};

const Furniture = ({design}: {design: Design}) =>
{
    const model = useMemo(() => buildFurniture(design), [design]);
    const {material: frame, reheat} = useFrameMaterial(design);

    // Parte pintada: color liso o textura de franjas / arte. Se crea de nuevo (no se
    // muta) cuando cambia el patrón o el color.
    const accent = useMemo(() =>
    {
        const map = design.pattern === 'solid' ? null : createPatternTexture(design.pattern, design.colors.accent);
        return new MeshStandardMaterial({
            color:     map ? '#ffffff' : findColor(design.colors.accent).hex,
            map,
            metalness: 0.15,
            roughness: 0.5,
            side:      DoubleSide,
        });
    }, [design.pattern, design.colors.accent]);

    // Cojín: tela blanca o estampada
    const cushion = useMemo(() =>
    {
        const map = design.cushion === 'print' ? createFabricTexture() : null;
        return new MeshStandardMaterial({color: map ? '#ffffff' : '#f3f1ec', map, metalness: 0, roughness: 0.95});
    }, [design.cushion]);

    useEffect(() => () =>
    {
        accent.map?.dispose();
        accent.dispose();
    }, [accent]);
    useEffect(() => () =>
    {
        cushion.map?.dispose();
        cushion.dispose();
    }, [cushion]);

    useEffect(() => reheat(0.3), [model, reheat]);

    const materials = {frame, accent, cushion, plant: PLANT, glass: GLASS};

    return (
        <group>
            {/* key con tamaño: cada tamaño puede tener otras partes (poltrona vs. sofá) y se
                montan desde cero, sin heredar posición ni rotación de la parte anterior */}
            {model.shapes.map((shape, i) => <ShapeMesh key={`${design.type}-${design.size}-${i}`} shape={shape} material={materials[shape.material]} />)}
            <FitCamera width={Math.max(model.width, model.depth * 0.9)} height={model.height} elevated />
        </group>
    );
};

// ─── Escena ──────────────────────────────────────────────────────────────────
const PieceScene = ({design, onReady}: PieceSceneProps) =>
{
    const furniture = isFurniture(design.type);
    const width     = design.widthCm / 100;

    return (
        <Canvas dpr={[1, 2]} camera={{position: [0, 1.2, 8], fov: FOV}} gl={{antialias: true, alpha: true}} onCreated={() => onReady?.()}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 4, 5]} intensity={2} />
            <directionalLight position={[-3, 1, -3]} intensity={1} color="#9fd2f2" />

            {/* key: al cambiar de familia se reinicia la vista inicial (de frente o en 3/4) */}
            <PresentationControls
                key={furniture ? 'furniture' : 'ornamental'}
                global={false}
                cursor
                snap
                speed={1.4}
                zoom={1}
                rotation={furniture ? [0.05, -0.6, 0] : [0, 0, 0]}
                polar={furniture ? [-0.2, 0.35] : [-0.15, 0.25]}
                azimuth={furniture ? [-Infinity, Infinity] : [-0.9, 0.9]}
            >
                {furniture ? <Furniture design={design} /> : <Ornamental design={design} />}
            </PresentationControls>

            <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={Math.max(furniture ? 3 : 4, width * 1.6)} blur={2.4} far={1.5} />
            <Environment resolution={256}>
                <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 5, 3]} scale={[8, 2, 1]} />
                <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 1, 6]} scale={[8, 5, 1]} />
                <Lightformer form="rect" intensity={3.5} color="#ff8a3d" position={[6, 1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 4, 1]} />
                <Lightformer form="rect" intensity={1.2} color="#9fd2f2" position={[-6, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[3, 4, 1]} />
            </Environment>
        </Canvas>
    );
};

export default PieceScene;
