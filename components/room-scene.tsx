"use client";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import {
  CameraControls,
  ContactShadows,
  useGLTF,
  RoundedBox,
} from "@react-three/drei";
import { Mesh, MeshStandardMaterial, type Group } from "three";
import { catalog, finishes } from "@/lib/catalog";
import type { Item } from "@/lib/workspace";
import { RoomFallback } from "./room-fallback";
import type { SceneProps } from "./room-preview";

function Model({
  id,
  position = [0, 0, 0],
  rotation = 0,
  finish,
  onSelect,
}: {
  id: string;
  position?: [number, number, number];
  rotation?: number;
  finish?: string;
  onSelect?: () => void;
}) {
  const { scene } = useGLTF(catalog[id].assetPath, false);
  const clone = useMemo(() => {
    const object = scene.clone(true);
    object.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const source = child.material as MeshStandardMaterial;
        if (source.name === "wood" && finish) {
          child.material = source.clone();
          (child.material as MeshStandardMaterial).color.set(finish);
        }
      }
    });
    return object;
  }, [scene, finish]);
  useEffect(
    () => () => {
      clone.traverse((child) => {
        if (
          child instanceof Mesh &&
          (child.material as MeshStandardMaterial).name === "wood" &&
          finish
        )
          (child.material as MeshStandardMaterial).dispose();
      });
    },
    [clone, finish],
  );
  return (
    <primitive
      object={clone}
      position={position}
      rotation-y={rotation}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect?.();
      }}
    />
  );
}
function Block({
  size,
  pos,
  color,
  radius = 0.015,
  rotation = [0, 0, 0],
}: {
  size: [number, number, number];
  pos: [number, number, number];
  color: string;
  radius?: number;
  rotation?: [number, number, number];
}) {
  return (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={2}
      position={pos}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.85} />
    </RoundedBox>
  );
}
function Room({ color }: { color: string }) {
  return (
    <group>
      <Block
        size={[3.6, 0.12, 3.1]}
        pos={[0, -0.07, 0]}
        color="#dfd0b8"
        radius={0.035}
      />
      {Array.from({ length: 12 }, (_, i) => (
        <Block
          key={i}
          size={[0.006, 0.003, 3.03]}
          pos={[-1.63 + i * 0.297, -0.006, 0]}
          color="#cbb89c"
          radius={0.001}
        />
      ))}
      <Block size={[3.6, 2.65, 0.085]} pos={[0, 1.31, -1.53]} color={color} />
      {/* Left wall is built around a real opening rather than a window pasted on a wall. */}
      <Block size={[0.085, 0.78, 3.1]} pos={[-1.76, 0.38, 0]} color="#e9e3d6" />
      <Block
        size={[0.085, 0.44, 3.1]}
        pos={[-1.76, 2.425, 0]}
        color="#e9e3d6"
      />
      <Block
        size={[0.085, 1.43, 0.62]}
        pos={[-1.76, 1.49, -1.235]}
        color="#e9e3d6"
      />
      <Block
        size={[0.085, 1.43, 1.04]}
        pos={[-1.76, 1.49, 1.035]}
        color="#e9e3d6"
      />
      <Block
        size={[0.04, 1.4, 1.4]}
        pos={[-1.79, 1.48, -0.17]}
        color="#c3d8ce"
      />
      <Block
        size={[0.13, 0.055, 1.52]}
        pos={[-1.7, 0.79, -0.17]}
        color="#faf6eb"
      />
      {[0.52, -0.91].map((z) => (
        <Block
          key={z}
          size={[0.13, 1.45, 0.055]}
          pos={[-1.7, 1.5, z]}
          color="#faf6eb"
        />
      ))}
      <Block
        size={[0.13, 0.055, 1.52]}
        pos={[-1.7, 2.2, -0.17]}
        color="#faf6eb"
      />
      <Block
        size={[0.09, 1.4, 0.035]}
        pos={[-1.67, 1.5, -0.17]}
        color="#faf6eb"
      />
      <Block
        size={[0.09, 0.035, 1.4]}
        pos={[-1.67, 1.48, -0.17]}
        color="#faf6eb"
      />
      <Block
        size={[3.45, 0.065, 0.065]}
        pos={[0, 0.03, -1.45]}
        color="#f3eddf"
      />
      <Block
        size={[0.065, 0.065, 2.98]}
        pos={[-1.69, 0.03, 0]}
        color="#f3eddf"
      />
      {/* Original abstract print and shelf. */}
      <Block
        size={[0.66, 0.87, 0.045]}
        pos={[0.98, 1.72, -1.45]}
        color="#80634b"
      />
      <Block
        size={[0.6, 0.81, 0.018]}
        pos={[0.98, 1.72, -1.42]}
        color="#f2e8d4"
      />
      <mesh position={[0.98, 1.84, -1.405]}>
        <circleGeometry args={[0.18, 40]} />
        <meshStandardMaterial color="#b96e49" />
      </mesh>
      <Block
        size={[0.34, 0.29, 0.009]}
        pos={[0.99, 1.52, -1.405]}
        color="#7c8761"
        radius={0.004}
      />
      <Block
        size={[0.86, 0.045, 0.22]}
        pos={[-0.55, 1.72, -1.39]}
        color="#b99169"
      />
      {["#c18864", "#d8d3b9", "#85977a", "#d6ac6f"].map((c, i) => (
        <Block
          key={c}
          size={[0.075, 0.22 + (i % 2) * 0.03, 0.13]}
          pos={[-0.83 + i * 0.088, 1.86, -1.37]}
          color={c}
          rotation={[0, 0, i === 3 ? -0.16 : 0]}
        />
      ))}
      <Model id="plant" position={[-0.26, 1.75, -1.37]} />
      {/* A woven rug and storage stool give the room a lived-in scale. */}
      <Block
        size={[2.2, 0.008, 1.6]}
        pos={[0.15, 0.006, 0.47]}
        color="#ece5d4"
        radius={0.07}
      />
      {Array.from({ length: 14 }, (_, i) => (
        <Block
          key={i}
          size={[2.12, 0.002, 0.009]}
          pos={[0.15, 0.012, -0.26 + i * 0.11]}
          color="#ddd3bf"
          radius={0.001}
        />
      ))}
      <Block
        size={[0.4, 0.43, 0.4]}
        pos={[1.31, 0.22, -1.08]}
        color="#bd9874"
        radius={0.035}
      />
      <Model id="plant" position={[1.31, 0.44, -1.08]} />
    </group>
  );
}
function accessoryPosition(
  item: Item,
  width: number,
  depth: number,
): [number, number, number] {
  const rear = item.slot.startsWith("rear");
  const side = item.slot.endsWith("left")
    ? -1
    : item.slot.endsWith("right")
      ? 1
      : 0;
  const product = catalog[item.productId];
  const x = rear
    ? side * (width / 2 - product.width / 2 - 0.015)
    : side * (width / 2 - 0.13);
  return [x, 0.754, rear ? -depth / 2 + 0.15 : depth / 2 - 0.14];
}
function Camera({ view }: { view: SceneProps["view"] }) {
  const ref = useRef<React.ComponentRef<typeof CameraControls>>(null);
  useEffect(() => {
    const update = () => {
      const factor = window.matchMedia("(max-width: 700px)").matches ? 1.2 : 1;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const raw =
        view === "front"
          ? [0, 2.1, 5.7]
          : view === "top"
            ? [0.01, 6, 0.01]
            : [4.5, 3.4, 5.3];
      const coords = raw.map((n) => n * factor);
      void ref.current?.setLookAt(
        coords[0],
        coords[1],
        coords[2],
        0,
        0.9,
        0,
        !reduced,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [view]);
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={3.5}
      maxDistance={11}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.05}
      dollySpeed={0.6}
      truckSpeed={0}
    />
  );
}
function Contents({
  setup,
  view,
  onSelect,
  selected,
  onReady,
}: SceneProps & { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  const finish = finishes.find((f) => f.id === setup.finish)!.color;
  const color =
    setup.presetId === "creative"
      ? "#ddba9c"
      : setup.presetId === "essentials"
        ? "#ddd7bf"
        : "#b9c6a9";
  const desk = catalog[setup.deskId];
  const root = useRef<Group>(null);
  return (
    <group ref={root}>
      <ambientLight intensity={1.4} />
      <hemisphereLight args={["#fff8e7", "#a3a087", 1.1]} />
      <directionalLight
        position={[-3, 6, 4]}
        intensity={3.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[4, 3, -2]} intensity={0.6} />
      <Room color={color} />
      <group position={[0, 0, -0.43]}>
        <Model
          id={setup.deskId}
          finish={finish}
          onSelect={() => onSelect("desk")}
        />
        <Model
          id={setup.chairId}
          position={[0.16, 0, 0.78]}
          rotation={Math.PI}
          onSelect={() => onSelect("chair")}
        />
        {setup.items.map((item) => (
          <Model
            key={item.id}
            id={item.productId}
            position={accessoryPosition(item, desk.width, desk.depth)}
            onSelect={() => onSelect(item.id)}
          />
        ))}
        {selected && setup.items.some((i) => i.id === selected) && (
          <mesh
            rotation-x={-Math.PI / 2}
            position={
              accessoryPosition(
                setup.items.find((i) => i.id === selected)!,
                desk.width,
                desk.depth,
              ).map((n, i) => (i === 1 ? n + 0.003 : n)) as [
                number,
                number,
                number,
              ]
            }
          >
            <ringGeometry args={[0.095, 0.115, 40]} />
            <meshBasicMaterial color="#d7ef93" depthWrite={false} />
          </mesh>
        )}
      </group>
      <ContactShadows
        key={`${setup.deskId}-${setup.chairId}`}
        position={[0, -0.008, 0]}
        opacity={0.28}
        scale={5}
        blur={2.5}
        far={3}
        frames={1}
        resolution={256}
      />
      <Camera view={view} />
    </group>
  );
}
export default function RoomScene(props: SceneProps) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        aria-label="Interactive 3D workspace preview. Drag to rotate, scroll to zoom."
        shadows
        camera={{ position: [4.5, 3.4, 5.3], fov: 37 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ antialias: true, alpha: true }}
        fallback={<RoomFallback setup={props.setup} />}
      >
        <Suspense fallback={null}>
          <Contents {...props} onReady={onReady} />
        </Suspense>
      </Canvas>
      {!ready && (
        <div
          className="loading-panel"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          Opening your little room…
        </div>
      )}
    </div>
  );
}
