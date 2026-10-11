"use client";
import { Suspense, useCallback, useEffect, useState, useMemo } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, ContactShadows, useGLTF } from "@react-three/drei";
import { Mesh, MeshStandardMaterial } from "three";
import { RoomShell } from "./room-shell";
import { roomCameraScale, stoolPosition, wallZ } from "@/lib/room";
import { catalog, finishes } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useWalkInteraction } from "@/hooks/use-walk-interaction";
import { useOverviewCamera } from "@/hooks/use-overview-camera";
import { useMovable } from "@/hooks/use-movable";
import { useProductMove } from "@/hooks/use-product-move";
import { useProductPlacement } from "@/hooks/use-product-placement";
import type { ProductMoveController } from "@/types/product-interaction";
import { ProductMoveControls } from "./product-move-controls";
import { useEditorStore } from "./studio-provider";
import { cameraLocked } from "@/lib/stores/editor-store";
import {
  FirstPersonCamera,
  WalkControls,
  type WalkInput,
} from "./first-person";
import { RoomFallback } from "./room-fallback";
import type {
  InspectableSceneProps,
  Posture,
  SceneProps,
} from "@/types/viewer";
import { PreviewTools } from "./preview-tools";
import { SitInChairButton } from "./sit-in-chair-button";

const presetWallColors: Record<string, string> = {
  creative: "#ddba9c",
  essentials: "#ddd7bf",
};

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
      if (!(child instanceof Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const source = child.material as MeshStandardMaterial;
      if (source.name !== "wood" || !finish) return;
      child.material = source.clone();
      (child.material as MeshStandardMaterial).color.set(finish);
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
  onInspect,
  onDeleteRequest,
  onHoldCueChange,
  movement,
  children,
}: {
  id: string;
  setup: SceneProps["setup"];
  selected: boolean;
  editable: boolean;
  onSelect: SceneProps["onSelect"];
  onInspect: InspectableSceneProps["onInspect"];
  onDeleteRequest: InspectableSceneProps["onDeleteRequest"];
  onHoldCueChange: InspectableSceneProps["onHoldCueChange"];
  movement: ProductMoveController;
  children: React.ReactNode;
}) {
  const {
    group,
    position,
    y,
    furniture,
    wall,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerOver,
    onPointerOut,
  } = useMovable({
    id,
    setup,
    editable,
    onSelect,
    onInspect,
    onDeleteRequest,
    onHoldCueChange,
    movement,
  });
  return (
    <group
      ref={group}
      position={[position.x, position.y ?? y, position.z]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {children}
      {selected && editable && (
        <mesh
          rotation-x={wall ? 0 : -Math.PI / 2}
          position={
            wall
              ? [
                  0,
                  catalog[setup.items.find((item) => item.id === id)!.productId]
                    .height / 2,
                  0.06,
                ]
              : [0, 0.012, 0]
          }
        >
          <ringGeometry
            args={furniture ? [0.33, 0.35, 48] : [0.1, 0.115, 40]}
          />
          <meshBasicMaterial color="#c3e77f" depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
function Camera({
  view,
  zoomSteps,
  setup,
}: {
  setup: SceneProps["setup"];
  view: SceneProps["view"];
  zoomSteps: number;
}) {
  const ref = useOverviewCamera(view, zoomSteps, setup.room);
  const locked = useEditorStore(cameraLocked);
  return (
    <CameraControls
      ref={ref}
      makeDefault
      enabled={!locked}
      minDistance={3.5}
      maxDistance={11 * roomCameraScale(setup.room)}
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
  onInspect,
  onDeleteRequest,
  onHoldCueChange,
  walkInput,
  posture,
  fov,
  zoomSteps,
  onReady,
  movement,
}: InspectableSceneProps & {
  onReady: () => void;
  walkInput: React.RefObject<WalkInput>;
  posture: Posture;
  fov: number;
  zoomSteps: number;
  movement: ProductMoveController;
}) {
  useProductPlacement(setup, movement);
  useEffect(() => {
    onReady();
  }, [onReady]);
  const finish = finishes.find((f) => f.id === setup.finish)!.color;
  const color = presetWallColors[setup.presetId] ?? "#b9c6a9";
  return (
    <group>
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
      <RoomShell
        room={setup.room}
        color={color}
        hasWallItem={setup.items.some((item) => catalog[item.productId].mount)}
      />
      {!setup.items.some((item) => catalog[item.productId].mount) && (
        <Model
          id="ikea-fejka"
          position={[
            -0.26,
            setup.room.height * 0.65 + 0.023,
            wallZ(setup.room) + 0.14,
          ]}
        />
      )}
      <Model
        id="ikea-fejka"
        position={[
          stoolPosition(setup.room).x,
          0.43,
          stoolPosition(setup.room).z,
        ]}
      />
      <Movable
        id="desk"
        setup={setup}
        selected={selected === "desk"}
        editable={editable}
        onSelect={onSelect}
        onInspect={onInspect}
        onDeleteRequest={onDeleteRequest}
        onHoldCueChange={onHoldCueChange}
        movement={movement}
      >
        <Model id={setup.deskId} finish={finish} />
        {setup.items
          .filter((item) => !catalog[item.productId].mount)
          .map((item) => (
            <Movable
              key={item.id}
              id={item.id}
              setup={setup}
              selected={selected === item.id}
              editable={editable}
              onSelect={onSelect}
              onInspect={onInspect}
              onDeleteRequest={onDeleteRequest}
              onHoldCueChange={onHoldCueChange}
              movement={movement}
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
        onInspect={onInspect}
        onDeleteRequest={onDeleteRequest}
        onHoldCueChange={onHoldCueChange}
        movement={movement}
      >
        <Model id={setup.chairId} rotation={Math.PI} />
      </Movable>
      {setup.items
        .filter((item) => catalog[item.productId].mount)
        .map((item) => (
          <Movable
            key={item.id}
            id={item.id}
            setup={setup}
            selected={selected === item.id}
            editable={editable}
            onSelect={onSelect}
            onInspect={onInspect}
            onDeleteRequest={onDeleteRequest}
            onHoldCueChange={onHoldCueChange}
            movement={movement}
          >
            <Model id={item.productId} />
            {[-1, 1].map((side) => (
              <group
                key={side}
                position={[
                  side * catalog[item.productId].width * 0.26,
                  0.02,
                  -catalog[item.productId].depth / 2,
                ]}
              >
                <mesh position={[0, 0, -0.012]} castShadow>
                  <boxGeometry args={[0.035, 0.14, 0.025]} />
                  <meshStandardMaterial color="#a88257" />
                </mesh>
                <mesh position={[0, -0.045, 0.03]} castShadow>
                  <boxGeometry args={[0.045, 0.035, 0.09]} />
                  <meshStandardMaterial color="#a88257" />
                </mesh>
              </group>
            ))}
          </Movable>
        ))}
      <ContactShadows
        key={`${setup.deskId}-${setup.chairId}-${JSON.stringify(setup.layout)}-${JSON.stringify(setup.room)}`}
        position={[0, -0.008, 0]}
        opacity={0.28}
        scale={Math.max(setup.room.width, setup.room.depth) + 1}
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
        <Camera view={view} zoomSteps={zoomSteps} setup={setup} />
      )}
    </group>
  );
}
export default function RoomScene(props: InspectableSceneProps) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const {
    wrapper,
    input: walkInput,
    walking,
    keyboardEvents,
    lookEvents,
    setLocked,
  } = useWalkInteraction(props.view, props.posture, props.onExitWalk);
  const movement = useProductMove(props.editable, setLocked);
  const moving = useEditorStore((state) => state.session !== null);
  const { posture } = props;
  const [zoomSteps, setZoomSteps] = useState(0);
  const [fov, setFov] = useState(65);
  return (
    <div
      ref={wrapper}
      className={cn(
        "room-interaction relative w-full h-full [&.is-walking]:outline-offset-[-3px] [&.is-walking:focus-visible]:[outline:2px_solid_#6a8454]",
        walking &&
          "is-walking [&_.room-canvas]:cursor-grab [&_.room-canvas:active]:cursor-grabbing",
      )}
      {...keyboardEvents}
    >
      <div
        className="room-canvas relative w-full h-full touch-none"
        {...lookEvents}
        onContextMenu={(event) => event.preventDefault()}
      >
        <Canvas
          aria-label={
            walking
              ? "First-person 3D workspace"
              : "Interactive 3D workspace preview. Hold a product and slide left to move, right to inspect, or down to delete. Drag empty space to rotate; scroll to zoom."
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
              editable={props.editable}
              movement={movement}
              onReady={onReady}
              walkInput={walkInput}
              posture={posture}
              fov={fov}
              zoomSteps={zoomSteps}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className={cn(moving && "hidden")}>
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
      </div>
      <ProductMoveControls setup={props.setup} movement={movement} />
      {!walking && ready && !moving && (
        <div className="absolute bottom-10 left-5 z-[3]">
          <SitInChairButton onSit={props.onSit} />
        </div>
      )}
      {walking && ready && !moving && (
        <WalkControls
          input={walkInput}
          onExit={props.onExitWalk}
          setup={props.setup}
          posture={posture}
          onPostureChange={(next) => {
            walkInput.current.keys.clear();
            props.onPostureChange(next);
          }}
        />
      )}
      {!ready && (
        <div className="loading-panel h-full flex items-center justify-center text-base text-[#6d7b5b] pointer-events-none absolute inset-0">
          Opening your little room…
        </div>
      )}
    </div>
  );
}
