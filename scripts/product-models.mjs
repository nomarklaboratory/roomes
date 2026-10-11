import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const colors = {
  wood: "#cda773",
  metal: "#b9bdbf",
  dark: "#252827",
  fabric: "#424343",
  mesh: "#515755",
  cream: "#fff2c8",
  green: "#506d38",
  pot: "#565653",
};
const materials = Object.fromEntries(
  Object.entries(colors).map(([name, color]) => {
    const material = new T.MeshStandardMaterial({
      color,
      roughness: name === "metal" ? 0.35 : 0.8,
      metalness: name === "metal" ? 0.55 : 0,
    });
    material.name = name;
    return [name, material];
  }),
);

export function surfboard(product) {
  const group = new T.Group();
  const { width: length, height: width, depth: thickness } = product;
  const outline = new T.Shape();
  outline.moveTo(-length / 2, -width * 0.16);
  outline.quadraticCurveTo(-length * 0.56, 0, -length / 2, width * 0.16);
  outline.quadraticCurveTo(-length * 0.25, width / 2, 0, width / 2);
  outline.quadraticCurveTo(length * 0.41, width / 2, length / 2, 0);
  outline.quadraticCurveTo(length * 0.41, -width / 2, 0, -width / 2);
  outline.quadraticCurveTo(
    -length * 0.25,
    -width / 2,
    -length / 2,
    -width * 0.16,
  );
  const blue = new T.MeshStandardMaterial({ color: "#568fa4", roughness: 0.4 });
  blue.name = "blue-rail";
  const cream = new T.MeshStandardMaterial({
    color: "#f5f0dc",
    roughness: 0.5,
  });
  cream.name = "surfboard-deck";
  const body = new T.Mesh(
    new T.ExtrudeGeometry(outline, {
      depth: thickness - 0.016,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 16,
      steps: 1,
    }),
    blue,
  );
  body.position.z = -thickness / 2 + 0.008;
  group.add(body);
  const deck = new T.Mesh(new T.ShapeGeometry(outline, 16), cream);
  deck.scale.set(0.965, 0.9, 1);
  deck.position.z = thickness / 2 + 0.0005;
  group.add(deck);
  box(
    group,
    [length * 0.9, 0.007, 0.001],
    [0, 0, thickness / 2 + 0.001],
    "wood",
    0,
  );
  return group;
}

function box(group, size, position, material = "dark", radius = 0.008) {
  const mesh = new T.Mesh(
    radius === 0
      ? new T.BoxGeometry(...size)
      : new RoundedBoxGeometry(
          ...size,
          1,
          Math.min(radius, ...size.map((n) => n / 2)),
        ),
    typeof material === "string" ? materials[material] : material,
  );
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}
function cylinder(
  group,
  radius,
  height,
  position,
  material = "dark",
  top = radius,
) {
  const mesh = new T.Mesh(
    new T.CylinderGeometry(top, radius, height, 16),
    materials[material],
  );
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}
function rod(group, start, end, radius = 0.012, material = "dark") {
  const a = new T.Vector3(...start),
    b = new T.Vector3(...end);
  const mesh = cylinder(
    group,
    radius,
    a.distanceTo(b),
    a.clone().add(b).multiplyScalar(0.5).toArray(),
    material,
  );
  mesh.quaternion.setFromUnitVectors(
    new T.Vector3(0, 1, 0),
    b.sub(a).normalize(),
  );
  return mesh;
}
function tube(group, points, radius, material = "dark", closed = false) {
  const curve = new T.CatmullRomCurve3(
    points.map((p) => new T.Vector3(...p)),
    closed,
    "centripetal",
  );
  const mesh = new T.Mesh(
    new T.TubeGeometry(
      curve,
      Math.max(12, points.length * 3),
      radius,
      5,
      closed,
    ),
    materials[material],
  );
  group.add(mesh);
  return mesh;
}

export function jarvis(product) {
  const { width: w, depth: d, height: h } = product;
  const group = new T.Group();
  const tabletop = box(group, [w, 0.02, d], [0, h - 0.01, 0], "wood", 0.005);
  tabletop.name = "tabletop";
  if (product.id === "jarvis-laminate") {
    tabletop.material = materials.wood.clone();
    tabletop.material.color.set("#f4f2ed");
  }
  for (const x of [-w * 0.35, w * 0.35]) {
    box(group, [0.075, 0.038, d * 0.85], [x, 0.019, 0]);
    box(group, [0.072, 0.35, 0.072], [x, 0.21, 0]);
    box(group, [0.063, 0.25, 0.063], [x, 0.49, 0]);
    box(group, [0.054, 0.17, 0.054], [x, 0.65, 0]);
    box(group, [0.11, 0.02, d * 0.72], [x, h - 0.032, 0]);
  }
  box(group, [w * 0.72, 0.07, 0.06], [0, h - 0.065, 0]);
  box(group, [0.095, 0.026, 0.035], [w * 0.32, h - 0.035, d / 2 - 0.012]);
  box(
    group,
    [0.022, 0.005, 0.002],
    [w * 0.32, h - 0.035, d / 2 + 0.006],
    "metal",
    0.001,
  );
  return group;
}

function chairBase(group, product) {
  const seat = product.seatHeight;
  cylinder(group, 0.027, seat - 0.14, [0, (seat - 0.14) / 2 + 0.07, 0]);
  cylinder(group, 0.048, 0.06, [0, seat - 0.08, 0]);
  const radiusX = (product.width - 0.04) / (2 * Math.sin((2 * Math.PI) / 5));
  const radiusZ = (product.depth - 0.06) / (1 + Math.cos(Math.PI / 5));
  const centerZ = (-radiusZ * (1 - Math.cos(Math.PI / 5))) / 2;
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const x = Math.sin(angle) * radiusX,
      z = Math.cos(angle) * radiusZ + centerZ;
    rod(group, [0, 0.105, 0], [x, 0.065, z], 0.018);
    const wheel = cylinder(group, 0.03, 0.04, [x, 0.03, z]);
    wheel.rotation.z = Math.PI / 2;
  }
}
function chairArms(group, product, curved) {
  for (const direction of [-1, 1]) {
    const x = direction * (product.width / 2 - 0.034);
    const y = product.seatHeight + 0.19;
    if (curved)
      tube(
        group,
        [
          [x * 0.82, product.seatHeight - 0.04, -0.14],
          [x, y - 0.07, -0.12],
          [x, y - 0.02, -0.045],
        ],
        0.017,
      );
    else
      rod(
        group,
        [x * 0.85, product.seatHeight - 0.04, -0.1],
        [x, y - 0.018, -0.065],
        0.014,
      );
    box(group, [0.068, 0.036, 0.245], [x, y, 0.01], "dark", 0.016);
  }
}
function suspensionBack(group, product, aeron) {
  const low = product.seatHeight + 0.06;
  const high = product.height - (aeron ? 0.018 : 0.006);
  const at = (u, v) => {
    const width = aeron
      ? 0.36 + Math.sin(v * Math.PI * 0.9) * 0.1 + v * 0.04
      : 0.255 + Math.sin((v * Math.PI) / 2) * 0.19;
    return [
      (u * width) / 2,
      low + (high - low) * v - (aeron ? Math.abs(u) ** 3 * v * 0.035 : 0),
      (aeron ? -0.17 : -0.14) - v * 0.065 + (1 - u * u) * 0.022,
    ];
  };
  if (aeron) {
    const frame = [-1, -0.5, 0, 0.5, 1].map((u) => at(u, 1));
    frame.push(
      at(1, 0.65),
      at(1, 0.2),
      at(0.7, 0),
      at(0, 0),
      at(-0.7, 0),
      at(-1, 0.2),
      at(-1, 0.65),
    );
    tube(group, frame, 0.016, "dark", true);
    tube(
      group,
      [
        [0, product.seatHeight - 0.045, -0.2],
        [0, low + 0.13, -0.24],
        [0, low + 0.22, -0.23],
      ],
      0.027,
    );
    box(group, [0.2, 0.075, 0.025], [0, low + 0.105, -0.205], "dark", 0.02);
  } else {
    // Sayl's central Y tower and frameless suspension are its defining silhouette.
    rod(
      group,
      [0, product.seatHeight - 0.03, -0.19],
      [0, low + 0.23, -0.23],
      0.022,
    );
    for (const side of [-1, 1])
      tube(
        group,
        [
          [0, low + 0.2, -0.23],
          [side * 0.09, low + 0.36, -0.23],
          [side * 0.18, high - 0.025, -0.22],
        ],
        0.014,
      );
  }
  const radius = aeron ? 0.002 : 0.0055;
  for (let row = 0; row <= 13; row++) {
    const v = row / 13;
    tube(
      group,
      [-1, -0.5, 0, 0.5, 1].map((u) => at(u, v)),
      radius,
      aeron ? "mesh" : "dark",
    );
  }
  for (let column = 0; column <= 10; column++) {
    const u = column / 5 - 1;
    tube(
      group,
      [0, 0.25, 0.5, 0.75, 1].map((v) => at(u, v)),
      radius,
      aeron ? "mesh" : "dark",
    );
  }
}
export function chair(product, aeron) {
  const group = new T.Group();
  chairBase(group, product);
  const seat = new T.Group();
  seat.name = "seat";
  group.add(seat);
  const { width, depth } = product.seat;
  const height = product.seatHeight;
  if (aeron) {
    for (const x of [-width / 2 + 0.014, width / 2 - 0.014])
      box(seat, [0.028, 0.035, depth], [x, height - 0.0175, 0], "dark", 0.012);
    for (const z of [-depth / 2 + 0.018, depth / 2 - 0.018])
      box(seat, [width, 0.035, 0.036], [0, height - 0.0175, z], "dark", 0.012);
    for (let row = 0; row < 15; row++)
      box(
        seat,
        [width - 0.035, 0.002, 0.002],
        [0, height - 0.008, -depth / 2 + 0.025 + (row * (depth - 0.05)) / 14],
        "mesh",
        0,
      );
    for (let column = 0; column < 12; column++)
      box(
        seat,
        [0.002, 0.002, depth - 0.045],
        [
          -width / 2 + 0.025 + (column * (width - 0.05)) / 11,
          height - 0.008,
          0,
        ],
        "mesh",
        0,
      );
  } else {
    box(seat, [width, 0.065, depth], [0, height - 0.0325, 0], "fabric", 0.027);
  }
  chairArms(group, product, aeron);
  const back = new T.Group();
  suspensionBack(back, product, aeron);
  group.add(back);
  // Match the overall height without stretching the seat or gas lift.
  back.updateMatrixWorld(true);
  const top = new T.Box3().setFromObject(back, true).max.y;
  back.position.y += product.height - top;
  return group;
}

function curvedPanel(group, width, height, radius, y, z, material, name) {
  // Width is arc length. Geometry, not a texture, represents 1900R curvature.
  const positions = [],
    indices = [];
  const count = 32;
  for (let i = 0; i <= count; i++) {
    const angle = ((i / count - 0.5) * width) / radius;
    const x = Math.sin(angle) * radius,
      depth = (1 - Math.cos(angle)) * radius;
    positions.push(x, -height / 2, depth, x, height / 2, depth);
    if (i < count) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new T.Mesh(geometry, material);
  mesh.position.set(0, y, z);
  mesh.name = name;
  group.add(mesh);
  return mesh;
}
export function monitor(product) {
  const { width: w, depth: d, height: h, screen } = product;
  const group = new T.Group();
  const activeH = (screen.inches * 0.0254) / Math.sqrt(screen.aspect ** 2 + 1);
  const activeW = activeH * screen.aspect;
  const panelH = activeH + 0.024,
    centerY = h - panelH / 2;
  box(group, [0.235, 0.02, d], [0, 0.01, 0], "metal", 0.004);
  box(
    group,
    [0.046, centerY - 0.02, 0.038],
    [0, centerY / 2 + 0.01, -0.05],
    "metal",
  );
  const display = new T.MeshStandardMaterial({
    color: "#15312c",
    emissive: "#18372c",
    emissiveIntensity: 0.3,
    roughness: 0.65,
    side: T.DoubleSide,
  });
  display.name = "screen";
  if (screen.radius) {
    const housing = materials.dark.clone();
    housing.side = T.DoubleSide;
    const housingArc = 2 * screen.radius * Math.asin(w / (2 * screen.radius));
    curvedPanel(
      group,
      housingArc,
      panelH,
      screen.radius,
      centerY,
      -0.022,
      housing,
      "curved-housing",
    );
    curvedPanel(
      group,
      activeW,
      activeH,
      screen.radius,
      centerY,
      -0.018,
      display,
      "active-screen",
    );
    for (const side of [-1, 1])
      box(
        group,
        [0.004, panelH, 0.025],
        [side * (w / 2 - 0.002), centerY, 0.011],
        "metal",
        0.001,
      );
  } else {
    box(group, [w, panelH, 0.03], [0, centerY, 0], "metal", 0.004);
    box(
      group,
      [w - 0.004, panelH - 0.004, 0.004],
      [0, centerY, 0.016],
      "dark",
      0.001,
    );
    box(
      group,
      [activeW, activeH, 0.002],
      [0, centerY, 0.019],
      display,
      0.0005,
    ).name = "active-screen";
  }
  // Abstract screen content keeps the room preview legible at small sizes.
  for (let i = 0; i < 4; i++) {
    const x = -activeW * 0.23,
      y = centerY + activeH * 0.27 - i * 0.027;
    const z = screen.radius
      ? -0.015 + screen.radius * (1 - Math.cos(x / screen.radius))
      : 0.021;
    box(
      group,
      [activeW * (i === 0 ? 0.35 : 0.25), 0.005, 0.001],
      [x, y, z],
      "cream",
      0.0004,
    );
  }
  return group;
}

export function wit() {
  const group = new T.Group();
  cylinder(group, 0.11, 0.024, [-0.185, 0.012, 0], "metal");
  const joints = [
    [-0.185, 0.026, 0],
    [-0.235, 0.36, 0],
    [0.115, 0.585, 0],
  ];
  for (let i = 0; i < 2; i++) {
    rod(group, joints[i], joints[i + 1], 0.013, "metal");
    const joint = cylinder(group, 0.025, 0.028, joints[i + 1], "metal");
    joint.rotation.x = Math.PI / 2;
  }
  const head = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    head.push([-0.045 + t * 0.325, 0.61 - Math.sin(t * Math.PI) * 0.028, 0]);
  }
  tube(group, head, 0.015, "metal");
  tube(
    group,
    head.map(([x, y, z]) => [x, y - 0.012, z]),
    0.006,
    "cream",
  );
  cylinder(group, 0.021, 0.015, [0.115, 0.6, 0], "dark");
  return group;
}
export function fejka() {
  const group = new T.Group();
  cylinder(group, 0.035, 0.073, [0, 0.0365, 0], "pot", 0.045);
  cylinder(group, 0.043, 0.003, [0, 0.074, 0]);
  for (let branch = 0; branch < 13; branch++) {
    const angle = branch * 2.39996;
    const spread = branch === 0 ? 0 : 0.055 + (branch % 3) * 0.018;
    const height = branch === 0 ? 0.202 : 0.125 + (branch % 4) * 0.018;
    const end = [Math.sin(angle) * spread, height, Math.cos(angle) * spread];
    rod(group, [0, 0.068, 0], end, 0.0018, "green");
    for (let leaf = 2; leaf <= 6; leaf++) {
      const t = leaf / 7;
      const center = [end[0] * t, 0.068 + (height - 0.068) * t, end[2] * t];
      for (const side of [-1, 1]) {
        const tip = [
          center[0] + Math.cos(angle) * 0.012 * side,
          center[1] + 0.011,
          center[2] - Math.sin(angle) * 0.012 * side,
        ];
        rod(group, center, tip, 0.0015, "green");
      }
    }
  }
  return group;
}
export function curve() {
  const group = new T.Group();
  // A continuous U-shaped base and two raised rails; the stand has no solid tray.
  tube(
    group,
    [
      [-0.113, 0.012, 0.09],
      [-0.12, 0.012, -0.07],
      [-0.095, 0.012, -0.101],
      [0, 0.012, -0.101],
      [0.095, 0.012, -0.101],
      [0.12, 0.012, -0.07],
      [0.113, 0.012, 0.09],
    ],
    0.011,
  );
  for (const side of [-1, 1]) {
    const x = side * 0.113;
    tube(
      group,
      [
        [x, 0.012, -0.06],
        [x, 0.05, -0.075],
        [x, 0.137, -0.084],
        [x, 0.14, -0.055],
        [x, 0.105, 0.085],
        [x, 0.123, 0.093],
      ],
      0.011,
    );
    const pad = box(
      group,
      [0.026, 0.006, 0.157],
      [x, 0.128, 0.005],
      "fabric",
      0.002,
    );
    pad.rotation.x = -0.245;
  }
  return group;
}
