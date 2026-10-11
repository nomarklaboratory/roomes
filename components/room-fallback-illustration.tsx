import type { ComponentType } from "react";
import { catalog, type AccessoryKind } from "@/lib/catalog";
import { positionOf } from "@/lib/placement";
import type { Setup } from "@/lib/workspace";
import { isMat } from "@/lib/accessory-placement";
import {
  DeskMatArtwork,
  MousePadArtwork,
  KeyboardArtwork,
  MouseArtwork,
  ControllerArtwork,
} from "./desk-accessory-artwork";

type WorkspaceItem = Setup["items"][number];

function MonitorArtwork() {
  return (
    <>
      <path fill="#303e37" d="m-30-20 70 24v65l-70-24z" />
      <path stroke="#b8c986" strokeWidth="4" d="m-21-4 50 17m-50-6 25 9" />
      <path stroke="#888d7e" strokeWidth="6" d="M5 56v18" />
    </>
  );
}

function PlantArtwork() {
  return (
    <>
      <path fill="#b87b58" d="m-8 0 22 8-3 22-18-8z" />
      <path
        stroke="#5f8257"
        strokeWidth="7"
        d="M2 6v-30m0 12-16-11m16 19 16-13"
      />
    </>
  );
}

function LampArtwork() {
  return (
    <>
      <path stroke="#526b54" strokeWidth="5" d="M0 12v-36l14-11" />
      <path fill="#738361" d="m9-41 17 6-3 12-19-5z" />
    </>
  );
}

function StandArtwork() {
  return <path stroke="#87918b" strokeWidth="7" d="m0 0 25-7 0 16-25 7z" />;
}

function SurfboardArtwork() {
  return (
    <path
      fill="#f5f0dc"
      stroke="#568fa4"
      strokeWidth="5"
      d="M-95 0Q-75-32 0-24Q75-18 95 0Q75 18 0 24Q-75 32-95 0Z"
    />
  );
}

const artworkByKind: Record<AccessoryKind, ComponentType> = {
  monitor: MonitorArtwork,
  plant: PlantArtwork,
  lamp: LampArtwork,
  stand: StandArtwork,
  surfboard: SurfboardArtwork,
  "desk-mat": DeskMatArtwork,
  "mouse-pad": MousePadArtwork,
  keyboard: KeyboardArtwork,
  mouse: MouseArtwork,
  controller: ControllerArtwork,
};

const originByKind: Record<AccessoryKind, readonly [number, number]> = {
  monitor: [330, 205],
  plant: [335, 275],
  lamp: [335, 275],
  stand: [335, 275],
  surfboard: [435, 140],
  "desk-mat": [335, 275],
  "mouse-pad": [335, 275],
  keyboard: [335, 275],
  mouse: [335, 275],
  controller: [335, 275],
};

function FallbackItem({ item, setup }: { item: WorkspaceItem; setup: Setup }) {
  const product = catalog[item.productId];
  const kind = product.kind ?? "stand";
  const Artwork = artworkByKind[kind];
  const position = positionOf(setup, item.id);
  if (product.mount)
    return (
      <g
        transform={`translate(${350 + 65 * position.x + (80 * setup.room.depth) / 2} ${315 + 30 * position.x - (45 * setup.room.depth) / 2 - ((position.y ?? 1.6) + product.height / 2) * 80}) rotate(24)`}
      >
        <Artwork />
      </g>
    );
  const x = 145 * (position.x - position.z);
  const y = 66 * position.x + 75 * position.z;
  const [originX, originY] = originByKind[kind];

  return (
    <g transform={`translate(${originX + x} ${originY + y})`}>
      <Artwork />
    </g>
  );
}

export function RoomFallbackIllustration({
  setup,
  finish,
}: {
  setup: Setup;
  finish: string;
}) {
  const project = (x: number, z: number) => [145 * (x - z), 66 * x + 75 * z];
  const [deskX, deskY] = project(
    setup.layout.desk.x,
    setup.layout.desk.z + 0.43,
  );
  const [chairX, chairY] = project(
    setup.layout.chair.x - 0.16,
    setup.layout.chair.z - 0.35,
  );
  const { width, depth, height } = setup.room;
  const floorPoint = (x: number, z: number, y = 0) => [
    350 + 65 * x - 80 * z,
    315 + 30 * x + 45 * z - 80 * y,
  ];
  const a = floorPoint(-width / 2, depth / 2),
    b = floorPoint(-width / 2, -depth / 2),
    c = floorPoint(width / 2, -depth / 2),
    d = floorPoint(width / 2, depth / 2);
  const highA = floorPoint(-width / 2, depth / 2, height),
    highB = floorPoint(-width / 2, -depth / 2, height),
    highC = floorPoint(width / 2, -depth / 2, height);
  const path = (...points: number[][]) =>
    `M${points.map((p) => p.join(" ")).join("L")}Z`;
  const minX = Math.min(a[0], b[0], c[0], d[0], 90) - 25;
  const minY = Math.min(highA[1], highB[1], highC[1], 20) - 25;
  const maxX = Math.max(a[0], b[0], c[0], d[0], 610) + 25;
  const maxY = Math.max(a[1], b[1], c[1], d[1], 455) + 25;

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      aria-hidden="true"
    >
      <path fill="#ddd9ca" d={path(a, b, c, d)} />
      <path fill="#eeeee3" d={path(a, highA, highB, b)} />
      <path fill="#e1e6d6" d={path(b, highB, highC, c)} />
      <path
        fill="#d5e4e0"
        stroke="#fbfaf2"
        strokeWidth="12"
        d={path(
          floorPoint(-width / 2, -0.7, 0.8),
          floorPoint(-width / 2, -0.7, Math.min(2.2, height - 0.25)),
          floorPoint(-width / 2, 0.7, Math.min(2.2, height - 0.25)),
          floorPoint(-width / 2, 0.7, 0.8),
        )}
      />
      <g transform={`translate(${deskX} ${deskY})`}>
        <path
          fill={finish}
          d={
            setup.deskId === "jarvis-laminate"
              ? "m195 290 180-90 145 65-185 95z"
              : "m220 282 145-74 120 52-150 78z"
          }
        />
        <path stroke="#b6b8ae" strokeWidth="13" d="M237 292v90m220-112v91" />
        {setup.items
          .filter((item) => !catalog[item.productId].mount)
          .sort(
            (a, b) =>
              Number(isMat(catalog[b.productId])) -
              Number(isMat(catalog[a.productId])),
          )
          .map((item) => (
            <FallbackItem key={item.id} item={item} setup={setup} />
          ))}
      </g>
      {setup.items
        .filter((item) => catalog[item.productId].mount)
        .map((item) => (
          <FallbackItem key={item.id} item={item} setup={setup} />
        ))}
      <g transform={`translate(${360 + chairX} ${328 + chairY})`}>
        <path fill={"#39463d"} d="M-37-30Q-40-90 12-76q25 10 20 65z" />
        <path fill="#5f6b60" d="m-38-29 64 12 25 23-63 5z" />
        <path
          stroke="#525e53"
          strokeWidth="7"
          d="M0 9v57m-27 5 27-12 33 11M0 59l-5 25"
        />
      </g>
    </svg>
  );
}
