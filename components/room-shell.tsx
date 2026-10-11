import { RoundedBox } from "@react-three/drei";
import { stoolPosition, wallZ } from "@/lib/room";
import type { RoomDimensions } from "@/types/placement";

function Block({
  size,
  pos,
  color,
  radius = 0.015,
}: {
  size: [number, number, number];
  pos: [number, number, number];
  color: string;
  radius?: number;
}) {
  return (
    <RoundedBox
      args={size}
      position={pos}
      radius={Math.min(radius, Math.min(...size) / 2 - 0.00001)}
      smoothness={2}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.85} />
    </RoundedBox>
  );
}
export function RoomShell({
  room,
  color,
  hasWallItem,
}: {
  room: RoomDimensions;
  color: string;
  hasWallItem: boolean;
}) {
  const { width: w, depth: d, height: h } = room;
  const left = -w / 2 + 0.0425,
    back = wallZ(room);
  const windowDepth = Math.min(1.4, d * 0.5),
    windowCenter = -d * 0.055;
  const bottom = 0.78,
    top = Math.min(2.2, h - 0.25);
  const start = windowCenter - windowDepth / 2,
    end = windowCenter + windowDepth / 2;
  const plankCount = Math.ceil(w / 0.3),
    stool = stoolPosition(room);
  const rugW = Math.min(2.2, w - 0.4),
    rugD = Math.min(1.6, d - 0.6);
  const rugZ = Math.min(0.47, d / 2 - rugD / 2 - 0.15);
  return (
    <group>
      <Block
        size={[w, 0.12, d]}
        pos={[0, -0.06, 0]}
        color="#dfd0b8"
        radius={0.035}
      />
      {Array.from({ length: plankCount - 1 }, (_, i) => (
        <Block
          key={i}
          size={[0.006, 0.001, d - 0.07]}
          pos={[-w / 2 + ((i + 1) * w) / plankCount, 0.0005, 0]}
          color="#cbb89c"
          radius={0.0004}
        />
      ))}
      <Block
        size={[w, h, 0.085]}
        pos={[0, h / 2, -d / 2 + 0.0425]}
        color={color}
      />
      {/* Physical opening: the glazing and frame stay at human scale. */}
      <Block
        size={[0.085, bottom, d]}
        pos={[left, bottom / 2, 0]}
        color="#e9e3d6"
      />
      <Block
        size={[0.085, h - top, d]}
        pos={[left, (h + top) / 2, 0]}
        color="#e9e3d6"
      />
      <Block
        size={[0.085, top - bottom, start + d / 2]}
        pos={[left, (top + bottom) / 2, (-d / 2 + start) / 2]}
        color="#e9e3d6"
      />
      <Block
        size={[0.085, top - bottom, d / 2 - end]}
        pos={[left, (top + bottom) / 2, (d / 2 + end) / 2]}
        color="#e9e3d6"
      />
      <Block
        size={[0.035, top - bottom, windowDepth]}
        pos={[left - 0.025, (top + bottom) / 2, windowCenter]}
        color="#c3d8ce"
      />
      {[bottom, top].map((y) => (
        <Block
          key={y}
          size={[0.13, 0.055, windowDepth + 0.08]}
          pos={[left + 0.05, y, windowCenter]}
          color="#faf6eb"
        />
      ))}
      {[start, end, windowCenter].map((z) => (
        <Block
          key={z}
          size={[0.13, top - bottom, 0.045]}
          pos={[left + 0.05, (top + bottom) / 2, z]}
          color="#faf6eb"
        />
      ))}
      <Block
        size={[w - 0.15, 0.065, 0.065]}
        pos={[0, 0.0325, back + 0.03]}
        color="#f3eddf"
      />
      <Block
        size={[0.065, 0.065, d - 0.12]}
        pos={[left + 0.065, 0.0325, 0]}
        color="#f3eddf"
      />
      {!hasWallItem && (
        <group>
          <Block
            size={[0.66, 0.87, 0.045]}
            pos={[w / 2 - 0.82, h * 0.65, back + 0.035]}
            color="#80634b"
          />
          <Block
            size={[0.6, 0.81, 0.018]}
            pos={[w / 2 - 0.82, h * 0.65, back + 0.065]}
            color="#f2e8d4"
          />
          <mesh position={[w / 2 - 0.82, h * 0.65 + 0.12, back + 0.076]}>
            <circleGeometry args={[0.18, 40]} />
            <meshStandardMaterial color="#b96e49" />
          </mesh>
          <Block
            size={[0.34, 0.29, 0.009]}
            pos={[w / 2 - 0.81, h * 0.65 - 0.2, back + 0.079]}
            color="#7c8761"
            radius={0.004}
          />
          <Block
            size={[0.86, 0.045, 0.22]}
            pos={[-0.55, h * 0.65, back + 0.12]}
            color="#b99169"
          />
          {["#c18864", "#d8d3b9", "#85977a", "#d6ac6f"].map((c, i) => (
            <Block
              key={c}
              size={[0.075, 0.22 + (i % 2) * 0.03, 0.13]}
              pos={[-0.83 + i * 0.088, h * 0.65 + 0.14, back + 0.14]}
              color={c}
            />
          ))}
        </group>
      )}
      <Block
        size={[rugW, 0.008, rugD]}
        pos={[0, 0.004, rugZ]}
        color="#ece5d4"
        radius={0.003}
      />
      {Array.from({ length: 14 }, (_, i) => (
        <Block
          key={i}
          size={[rugW - 0.08, 0.001, 0.009]}
          pos={[0, 0.0085, rugZ - rugD / 2 + 0.07 + (i * (rugD - 0.14)) / 13]}
          color="#ddd3bf"
          radius={0.0004}
        />
      ))}
      <Block
        size={[0.4, 0.43, 0.4]}
        pos={[stool.x, 0.215, stool.z]}
        color="#bd9874"
        radius={0.035}
      />
    </group>
  );
}
