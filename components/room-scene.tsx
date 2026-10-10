"use client";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  CameraControls,
  ContactShadows,
  useGLTF,
  RoundedBox,
  CameraControlsImpl,
} from "@react-three/drei";
import { Mesh, MeshStandardMaterial, Plane, Vector3, type Group } from "three";
import { catalog, finishes } from "@/lib/catalog";
import { clampPosition, positionOf, type Point } from "@/lib/placement";
import {
  FirstPersonCamera,
  newWalkInput,
  WalkControls,
  walkKey,
  type WalkInput,
} from "./first-person";
import { RoomFallback } from "./room-fallback";
import type { Posture, SceneProps } from "@/types/viewer";
import { PreviewTools } from "./preview-tools";

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
        if (onSelect) {
          e.stopPropagation();
          onSelect();
        }
      }}
    />
  );
}
function Movable({
  id,
  setup,
  selected,
  editable,
  onSelect,
  onMove,
  children,
}: {
  id: string;
  setup: SceneProps["setup"];
  selected: boolean;
  editable: boolean;
  onSelect: SceneProps["onSelect"];
  onMove: SceneProps["onMove"];
  children: React.ReactNode;
}) {
  const get = useThree((s) => s.get);
  const gl = useThree((s) => s.gl);
  const group = useRef<Group>(null);
  const dragging = useRef<{
    pointer: number;
    offset: Point;
    start: Point;
    next: Point;
    release: () => void;
  } | null>(null);
  const original = positionOf(setup, id);
  const furniture = id === "desk" || id === "chair";
  const y = furniture ? 0 : 0.754;
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), -y), [y]);
  const point = useMemo(() => new Vector3(), []);
  const [draft, setDraft] = useState<Point | null>(null);
  const position = draft ?? original;
  const enableControls = (enabled: boolean) => {
    const controls = get().controls;
    if (controls instanceof CameraControlsImpl) controls.enabled = enabled;
  };
  const end = (event: ThreeEvent<PointerEvent>, commit: boolean) => {
    const drag = dragging.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    event.stopPropagation();
    dragging.current = null;
    drag.release();
    enableControls(true);
    gl.domElement.removeAttribute("data-dragging");
    gl.domElement.style.setProperty("cursor", "grab");
    setDraft(null);
    if (
      commit &&
      (drag.next.x !== drag.start.x || drag.next.z !== drag.start.z)
    )
      onMove(id, drag.next);
  };
  // Fiber clears hover on pointercancel but does not dispatch a mesh cancel
  // handler. Listen on the native canvas so interruptions always restore orbit.
  useEffect(() => {
    const canvas = gl.domElement;
    const cancel = (event?: Event) => {
      const drag = dragging.current;
      if (!drag) return;
      if (event instanceof PointerEvent && event.pointerId !== drag.pointer)
        return;
      dragging.current = null;
      drag.release();
      const controls = get().controls;
      if (controls instanceof CameraControlsImpl) controls.enabled = true;
      canvas.removeAttribute("data-dragging");
      canvas.style.removeProperty("cursor");
      setDraft(null);
    };
    const lost = (event: PointerEvent) => {
      const drag = dragging.current;
      if (!drag || drag.pointer !== event.pointerId) return;
      requestAnimationFrame(() => {
        if (dragging.current === drag) cancel();
      });
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
    };
    canvas.addEventListener("pointercancel", cancel);
    canvas.addEventListener("lostpointercapture", lost);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    return () => {
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("lostpointercapture", lost);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
      cancel();
    };
  }, [get, gl, editable]);
  return (
    <group
      ref={group}
      position={[position.x, y, position.z]}
      onPointerDown={
        editable
          ? (e) => {
              if (
                e.button !== 0 ||
                !e.isPrimary ||
                gl.domElement.hasAttribute("data-dragging") ||
                dragging.current ||
                !e.ray.intersectPlane(plane, point)
              )
                return;
              e.stopPropagation();
              onSelect(id);
              enableControls(false);
              gl.domElement.setAttribute("data-dragging", id);
              const origin = group.current!.getWorldPosition(new Vector3());
              dragging.current = {
                pointer: e.pointerId,
                offset: { x: point.x - origin.x, z: point.z - origin.z },
                start: original,
                next: original,
                release: () =>
                  (
                    e.target as {
                      releasePointerCapture: (id: number) => void;
                    } | null
                  )?.releasePointerCapture(e.pointerId),
              };
              (
                e.target as { setPointerCapture: (id: number) => void } | null
              )?.setPointerCapture(e.pointerId);
              gl.domElement.style.setProperty("cursor", "grabbing");
            }
          : undefined
      }
      onPointerMove={
        editable
          ? (e) => {
              const drag = dragging.current;
              if (!drag || drag.pointer !== e.pointerId) return;
              e.stopPropagation();
              if (!e.ray.intersectPlane(plane, point)) return;
              const deskOffset = furniture ? { x: 0, z: 0 } : setup.layout.desk;
              drag.next = clampPosition(setup, id, {
                x: point.x - drag.offset.x - deskOffset.x,
                z: point.z - drag.offset.z - deskOffset.z,
              });
              setDraft(drag.next);
            }
          : undefined
      }
      onPointerUp={editable ? (e) => end(e, true) : undefined}
      onPointerOver={
        editable
          ? (e) => {
              if (gl.domElement.hasAttribute("data-dragging")) return;
              e.stopPropagation();
              if (!dragging.current)
                gl.domElement.style.setProperty("cursor", "grab");
            }
          : undefined
      }
      onPointerOut={
        editable
          ? () => {
              if (!dragging.current)
                gl.domElement.style.removeProperty("cursor");
            }
          : undefined
      }
    >
      {children}
      {selected && editable && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
          <ringGeometry
            args={furniture ? [0.33, 0.35, 48] : [0.1, 0.115, 40]}
          />
          <meshBasicMaterial color="#c3e77f" depthWrite={false} />
        </mesh>
      )}
    </group>
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
      radius={Math.min(radius, Math.min(...size) / 2 - 0.00001)}
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
        pos={[0, -0.06, 0]}
        color="#dfd0b8"
        radius={0.035}
      />
      {Array.from({ length: 12 }, (_, i) => (
        <Block
          key={i}
          size={[0.006, 0.001, 3.03]}
          pos={[-1.63 + i * 0.297, 0.0005, 0]}
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
        pos={[0.15, 0.004, 0.47]}
        color="#ece5d4"
        radius={0.07}
      />
      {Array.from({ length: 14 }, (_, i) => (
        <Block
          key={i}
          size={[2.12, 0.001, 0.009]}
          pos={[0.15, 0.0085, -0.26 + i * 0.11]}
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
function Camera({
  view,
  zoomSteps,
}: {
  view: SceneProps["view"];
  zoomSteps: number;
}) {
  const ref = useRef<React.ComponentRef<typeof CameraControls>>(null);
  const lastZoom = useRef(zoomSteps);
  useEffect(() => {
    const delta = zoomSteps - lastZoom.current;
    lastZoom.current = zoomSteps;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (delta) void ref.current?.dolly(delta * 0.7, !reduced);
  }, [zoomSteps]);
  useEffect(() => {
    let lastFactor = 0;
    const update = (event?: Event) => {
      const factor = window.matchMedia("(max-width: 700px)").matches ? 1.2 : 1;
      if (event && factor === lastFactor) return;
      lastFactor = factor;
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
      minPolarAngle={view === "top" ? 0.001 : 0.15}
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
  editable,
  onMove,
  walkInput,
  posture,
  fov,
  zoomSteps,
  onReady,
}: SceneProps & {
  onReady: () => void;
  walkInput: React.RefObject<WalkInput>;
  posture: Posture;
  fov: number;
  zoomSteps: number;
}) {
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
      <Movable
        id="desk"
        setup={setup}
        selected={selected === "desk"}
        editable={editable}
        onSelect={onSelect}
        onMove={onMove}
      >
        <Model id={setup.deskId} finish={finish} />
        {setup.items.map((item) => (
          <Movable
            key={item.id}
            id={item.id}
            setup={setup}
            selected={selected === item.id}
            editable={editable}
            onSelect={onSelect}
            onMove={onMove}
          >
            <Model id={item.productId} />
          </Movable>
        ))}
      </Movable>
      <Movable
        id="chair"
        setup={setup}
        selected={selected === "chair"}
        editable={editable}
        onSelect={onSelect}
        onMove={onMove}
      >
        <Model id={setup.chairId} rotation={Math.PI} />
      </Movable>
      <ContactShadows
        key={`${setup.deskId}-${setup.chairId}-${JSON.stringify(setup.layout)}`}
        position={[0, -0.008, 0]}
        opacity={0.28}
        scale={5}
        blur={2.5}
        far={3}
        frames={1}
        resolution={256}
      />
      {view === "walk" ? (
        <FirstPersonCamera
          setup={setup}
          input={walkInput}
          posture={posture}
          fov={fov}
        />
      ) : (
        <Camera view={view} zoomSteps={zoomSteps} />
      )}
    </group>
  );
}
export default function RoomScene(props: SceneProps) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const walkInput = useRef(newWalkInput());
  const wrapper = useRef<HTMLDivElement>(null);
  const [posture, setPosture] = useState<Posture>("standing");
  const [zoomSteps, setZoomSteps] = useState(0);
  const [fov, setFov] = useState(65);
  const looking = useRef<{ pointer: number; x: number; y: number } | null>(
    null,
  );
  const walking = props.view === "walk";
  useEffect(() => {
    if (walking) wrapper.current?.focus({ preventScroll: true });
    const stop = () => {
      walkInput.current.keys.clear();
      looking.current = null;
    };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      stop();
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [walking]);
  return (
    <div
      ref={wrapper}
      className={`room-interaction ${walking ? "is-walking" : ""}`}
      tabIndex={walking ? 0 : -1}
      role={walking ? "region" : undefined}
      aria-label={
        walking
          ? posture === "seated"
            ? "First-person workspace. Seated in your chair; drag to look, stand up to walk, Escape to exit."
            : "First-person workspace. Drag to look, use WASD or arrow keys to walk, Escape to exit."
          : undefined
      }
      onKeyDown={
        walking
          ? (e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                props.onExitWalk();
                return;
              }
              const direction = walkKey(e.key);
              if (direction) {
                e.preventDefault();
                if (posture === "standing")
                  walkInput.current.keys.add(direction);
              }
            }
          : undefined
      }
      onKeyUp={
        walking
          ? (e) => {
              const direction = walkKey(e.key);
              if (direction) {
                e.preventDefault();
                walkInput.current.keys.delete(direction);
              }
            }
          : undefined
      }
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget))
          walkInput.current.keys.clear();
      }}
    >
      <div
        className="room-canvas"
        onPointerDown={
          walking
            ? (e) => {
                if (e.button !== 0 || looking.current) return;
                wrapper.current?.focus({ preventScroll: true });
                looking.current = {
                  pointer: e.pointerId,
                  x: e.clientX,
                  y: e.clientY,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }
            : undefined
        }
        onPointerMove={
          walking
            ? (e) => {
                const look = looking.current;
                if (!look || look.pointer !== e.pointerId) return;
                walkInput.current.look(e.clientX - look.x, e.clientY - look.y);
                look.x = e.clientX;
                look.y = e.clientY;
              }
            : undefined
        }
        onPointerUp={
          walking
            ? (e) => {
                looking.current = null;
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
            : undefined
        }
        onPointerCancel={() => {
          looking.current = null;
        }}
        onLostPointerCapture={() => {
          looking.current = null;
        }}
      >
        <Canvas
          aria-label={
            walking
              ? "First-person 3D workspace"
              : "Interactive 3D workspace preview. Drag items to move; drag empty space to rotate, scroll to zoom."
          }
          shadows
          camera={{ position: [4.5, 3.4, 5.3], fov: 37 }}
          dpr={[1, 1.5]}
          frameloop={walking ? "always" : "demand"}
          gl={{ antialias: true, alpha: true }}
          fallback={<RoomFallback setup={props.setup} />}
        >
          <Suspense fallback={null}>
            <Contents
              {...props}
              editable={props.editable && !walking}
              onReady={onReady}
              walkInput={walkInput}
              posture={posture}
              fov={fov}
              zoomSteps={zoomSteps}
            />
          </Suspense>
        </Canvas>
      </div>
      <PreviewTools
        container={wrapper}
        expanded={props.previewExpanded}
        onExpandedChange={props.onPreviewExpandedChange}
        onZoom={(direction) => {
          if (walking)
            setFov((value) =>
              Math.max(35, Math.min(85, value - direction * 5)),
            );
          else setZoomSteps((value) => value + direction);
        }}
      />
      {walking && ready && (
        <WalkControls
          input={walkInput}
          onExit={props.onExitWalk}
          setup={props.setup}
          posture={posture}
          onPostureChange={(next) => {
            walkInput.current.keys.clear();
            setPosture(next);
          }}
        />
      )}
      {!ready && (
        <div className="loading-panel pointer-events-none absolute inset-0">
          Opening your little room…
        </div>
      )}
    </div>
  );
}
