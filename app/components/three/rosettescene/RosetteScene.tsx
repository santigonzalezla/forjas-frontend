'use client';

import {useEffect, useMemo, useRef, type ReactNode, type RefObject} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {ContactShadows, Environment, Lightformer, PresentationControls} from '@react-three/drei';
import {CatmullRomCurve3, Color, Group, MathUtils, Mesh, MeshStandardMaterial, TubeGeometry, Vector3} from 'three';
import {buildRosette, type RosettePath} from '@/lib/rosette';
import {findFinish, type FinishId, type RosetteParts} from '@/lib/finishes';

interface RosetteSceneProps
{
    finish:   FinishId;
    parts:    RosetteParts;
    forgeKey: number;
    onReady?: () => void;
}

const RADIUS: Record<RosettePath['kind'], number> = {
    ring:    0.055,
    bar:     0.03,
    lobe:    0.028,
    scroll:  0.024,
    diamond: 0,
};

const HOT_COLOR    = new Color('#ff5a14');
const FINISH_COLOR = new Color();
const FORGE_TIME   = 2.2;
const COOLING_RATE = 0.55;

const toVectors = (points: [number, number][]) => points.map(([x, y]) => new Vector3(x, y, 0));

interface PartProps
{
    visible:   boolean;
    children:  ReactNode;
    progress?: RefObject<number>;
}

const Part = ({visible, children, progress}: PartProps) =>
{
    const ref = useRef<Group>(null);

    useFrame((_, delta) =>
    {
        if (!ref.current) return;
        const ready  = !progress || progress.current > 0.75;
        const target = visible && ready ? 1 : 0;
        const next   = MathUtils.damp(ref.current.scale.x, target, 10, delta);
        ref.current.scale.setScalar(next);
        ref.current.visible = next > 0.01;
    });

    return <group ref={ref}>{children}</group>;
};

const Rosette = ({finish, parts, forgeKey}: Omit<RosetteSceneProps, 'onReady'>) =>
{
    const spin     = useRef<Group>(null);
    const progress = useRef(0);
    const heat     = useRef(1);

    const material = useMemo(() => new MeshStandardMaterial({emissive: HOT_COLOR}), []);

    const {base, scrolls, diamonds, collars} = useMemo(() =>
    {
        const geometry = buildRosette();
        const tube     = (path: RosettePath) =>
        {
            const curve = new CatmullRomCurve3(toVectors(path.points), path.closed, 'centripetal');
            return new TubeGeometry(curve, Math.max(24, path.points.length * 2), RADIUS[path.kind], 10, path.closed);
        };

        const diamonds = geometry.paths
            .filter(path => path.kind === 'diamond')
            .map(path =>
            {
                const cx = path.points.reduce((s, p) => s + p[0], 0) / path.points.length;
                const cy = path.points.reduce((s, p) => s + p[1], 0) / path.points.length;
                return {position: [cx, cy, 0] as [number, number, number], angle: Math.atan2(cy, cx)};
            });

        return {
            base:     geometry.paths.filter(p => p.kind === 'ring' || p.kind === 'bar' || p.kind === 'lobe').map(tube),
            scrolls:  geometry.paths.filter(p => p.kind === 'scroll').map(tube),
            diamonds,
            collars:  geometry.collars,
        };
    }, []);

    const tubeMeshes = useRef<Mesh[]>([]);
    const tubeRef    = (index: number) => (mesh: Mesh | null) =>
    {
        if (mesh) tubeMeshes.current[index] = mesh;
    };

    useEffect(() =>
    {
        progress.current = 0;
        heat.current     = 1;
    }, [forgeKey]);

    useEffect(() =>
    {
        heat.current = Math.max(heat.current, 0.7);
    }, [parts.scrolls, parts.spears, parts.collars]);

    useFrame((_, delta) =>
    {
        if (progress.current < 1)
        {
            progress.current = Math.min(1, progress.current + delta / FORGE_TIME);
            const meshes = tubeMeshes.current;
            const n      = meshes.length;

            meshes.forEach((mesh, i) =>
            {
                const start = (i / n) * 0.7;
                const local = MathUtils.clamp((progress.current - start) / 0.3, 0, 1);
                const count = mesh.geometry.index?.count ?? 0;
                mesh.geometry.setDrawRange(0, Math.floor((count * local) / 3) * 3);
            });
        }

        if (progress.current > 0.6) heat.current = Math.max(0, heat.current - delta * COOLING_RATE);

        const shared = tubeMeshes.current[0]?.material as MeshStandardMaterial | undefined;
        if (shared)
        {
            const f = findFinish(finish);
            FINISH_COLOR.set(f.color);
            shared.color.lerp(FINISH_COLOR, 1 - Math.exp(-delta * 6));
            shared.metalness         = MathUtils.damp(shared.metalness, f.metalness, 6, delta);
            shared.roughness         = MathUtils.damp(shared.roughness, f.roughness, 6, delta);
            shared.emissiveIntensity = heat.current * 2.6;
        }

        if (spin.current) spin.current.rotation.y += delta * 0.18;
    });

    useEffect(() =>
    {
        const meshes = tubeMeshes.current;
        return () =>
        {
            meshes.forEach(mesh => mesh.geometry.dispose());
            (meshes[0]?.material as MeshStandardMaterial | undefined)?.dispose();
        };
    }, []);

    return (
        <group ref={spin}>
            {base.map((geometry, i) => <mesh key={`b-${i}`} ref={tubeRef(i)} geometry={geometry} material={material} />)}

            <Part visible={parts.scrolls}>
                {scrolls.map((geometry, i) => <mesh key={`s-${i}`} ref={tubeRef(base.length + i)} geometry={geometry} material={material} />)}
            </Part>

            <Part visible={parts.spears} progress={progress}>
                {diamonds.map((diamond, i) => (
                    <mesh key={`d-${i}`} position={diamond.position} rotation={[0, 0, diamond.angle]} scale={[0.075, 0.045, 0.03]} material={material}>
                        <octahedronGeometry args={[1, 0]} />
                    </mesh>
                ))}
            </Part>

            <Part visible={parts.collars} progress={progress}>
                {collars.map(([x, y], i) => (
                    <mesh key={`c-${i}`} position={[x, y, 0]} rotation={[0, 0, Math.atan2(y, x)]} material={material}>
                        <boxGeometry args={[0.05, 0.1, 0.075]} />
                    </mesh>
                ))}
            </Part>
        </group>
    );
};

const RosetteScene = ({finish, parts, forgeKey, onReady}: RosetteSceneProps) =>
{
    return (
        <Canvas
            dpr={[1, 2]}
            camera={{position: [0, 0, 4.3], fov: 35}}
            gl={{antialias: true, alpha: true}}
            onCreated={() => onReady?.()}
        >
            <ambientLight intensity={0.55} />
            <directionalLight position={[2, 3, 4]} intensity={2} />
            <directionalLight position={[-3, -1, -3]} intensity={1.2} color="#9fd2f2" />

            <PresentationControls
                global={false}
                cursor
                snap={false}
                speed={1.6}
                zoom={1}
                rotation={[0.08, 0, 0]}
                polar={[-0.5, 0.5]}
                azimuth={[-Infinity, Infinity]}
            >
                <Rosette finish={finish} parts={parts} forgeKey={forgeKey} />
            </PresentationControls>

            <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={4} blur={2.6} far={2} />
            <Environment resolution={256}>
                <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, 2]} scale={[6, 2, 1]} />
                <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[0, 0, 5]} scale={[5, 5, 1]} />
                <Lightformer form="rect" intensity={4.5} color="#ff8a3d" position={[4, 0.5, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 4, 1]} />
                <Lightformer form="rect" intensity={1.2} color="#9fd2f2" position={[-4, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[3, 4, 1]} />
            </Environment>
        </Canvas>
    );
};

export default RosetteScene;
