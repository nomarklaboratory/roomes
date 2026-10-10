import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";
import { catalog } from "../lib/catalog.ts";

// GLTFExporter uses FileReader for buffers, even with texture-free binary exports.
globalThis.FileReader = class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
  async readAsDataURL(blob) {
    this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`;
    this.onloadend?.();
  }
};
const palette = {
  wood: "#c9a77f",
  metal: "#dedbd2",
  dark: "#343c37",
  fabric: "#8b9c86",
  screen: "#1f302c",
  cream: "#e9e1d0",
  green: "#66885a",
  pot: "#be7251",
};
const mats = Object.fromEntries(
  Object.entries(palette).map(([name, color]) => {
    const m = new T.MeshStandardMaterial({
      color,
      roughness: 0.72,
      metalness: name === "metal" ? 0.25 : 0,
    });
    m.name = name;
    return [name, m];
  }),
);
function box(g, size, pos, mat = "metal", radius = 0.018, rot = 0) {
  const m = new T.Mesh(
    new RoundedBoxGeometry(
      ...size,
      2,
      Math.min(radius, ...size.map((v) => v / 2)),
    ),
    typeof mat === "string" ? mats[mat] : mat,
  );
  m.position.set(...pos);
  m.rotation.z = rot;
  g.add(m);
  return m;
}
function cyl(g, radius, height, pos, mat = "metal", top = radius) {
  const m = new T.Mesh(
    new T.CylinderGeometry(top, radius, height, 16),
    mats[mat],
  );
  m.position.set(...pos);
  g.add(m);
  return m;
}
function rod(g, a, b, r = 0.012, mat = "metal") {
  const p = new T.Vector3(...a),
    q = new T.Vector3(...b);
  const m = cyl(
    g,
    r,
    p.distanceTo(q),
    p.clone().add(q).multiplyScalar(0.5).toArray(),
    mat,
  );
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), q.sub(p).normalize());
  return m;
}
function sphere(g, size, pos, mat = "green", rot = 0) {
  const m = new T.Mesh(new T.SphereGeometry(1, 16, 10), mats[mat]);
  m.scale.set(...size);
  m.position.set(...pos);
  m.rotation.z = rot;
  g.add(m);
  return m;
}
function desk(product, electric = true) {
  const { width: w, depth: d, height: h } = product;
  const g = new T.Group();
  const top = box(g, [w, 0.055, d], [0, h - 0.055 / 2, 0], "wood", 0.025);
  top.name = "tabletop";
  for (const x of [-w * 0.36, w * 0.36]) {
    box(
      g,
      [electric ? 0.07 : 0.055, 0.64, 0.07],
      [x, 0.36, 0],
      electric ? "metal" : "dark",
    );
    box(
      g,
      [0.12, 0.045, d * 0.85],
      [x, 0.0225, 0],
      electric ? "metal" : "dark",
    );
    box(g, [0.15, 0.025, d * 0.8], [x, 0.684, 0]);
  }
  box(g, [w * 0.72, 0.06, 0.04], [0, 0.63, -d * 0.24]);
  if (electric)
    box(g, [0.09, 0.027, 0.035], [w * 0.33, 0.677, d * 0.42], "dark", 0.005);
  else {
    rod(g, [w * 0.43, 0.65, 0.2], [w / 2 - 0.02, 0.65, 0.2]);
    rod(g, [w / 2 - 0.02, 0.65, 0.2], [w / 2 - 0.02, 0.58, 0.2]);
    cyl(g, 0.018, 0.08, [w / 2 - 0.02, 0.55, 0.2], "dark");
  }
  return g;
}
function chair(product, ergonomic = true) {
  const g = new T.Group();
  const fabric = ergonomic ? "dark" : "fabric";
  const seatHeight = product.seatHeight;
  cyl(
    g,
    0.033,
    seatHeight - 0.18,
    [0, (seatHeight - 0.18) / 2 + 0.09, 0],
    "dark",
  );
  cyl(g, 0.056, 0.1, [0, seatHeight - 0.1, 0], "metal");
  // Elliptical base, centered on its bounds. Casters are 60 mm in diameter.
  const radiusX = (product.width - 0.04) / (2 * Math.sin((2 * Math.PI) / 5));
  const radiusZ = (product.depth - 0.06) / (1 + Math.cos(Math.PI / 5));
  const baseZ = (-radiusZ * (1 - Math.cos(Math.PI / 5))) / 2;
  for (let i = 0; i < 5; i++) {
    let a = (i * Math.PI * 2) / 5;
    const x = Math.sin(a) * radiusX,
      z = Math.cos(a) * radiusZ + baseZ;
    rod(g, [0, 0.13, 0], [x, 0.08, z], 0.021, "dark");
    const wheel = cyl(g, 0.03, 0.04, [x, 0.03, z], "dark");
    wheel.rotation.z = Math.PI / 2;
  }
  const seating = new T.Group();
  seating.position.y = seatHeight - (0.48 + 0.095 / 2);
  g.add(seating);
  const seat = box(
    seating,
    [ergonomic ? 0.5 : 0.47, 0.095, ergonomic ? 0.48 : 0.43],
    [0, 0.48, 0],
    fabric,
    0.06,
  );
  seat.name = "seat";
  const back = box(
    seating,
    [ergonomic ? 0.48 : 0.43, ergonomic ? 0.58 : 0.35, 0.07],
    [
      0,
      ergonomic
        ? 0.79
        : product.height -
          (0.35 * Math.cos(0.12) + 0.07 * Math.sin(0.12)) / 2 -
          seating.position.y,
      -0.2,
    ],
    fabric,
    0.05,
  );
  back.rotation.x = -0.12;
  if (!ergonomic) {
    g.updateMatrixWorld(true);
    back.position.y +=
      product.height - new T.Box3().setFromObject(back, true).max.y;
  }
  rod(seating, [0, 0.42, -0.15], [0, 0.8, -0.23], 0.028, "dark");
  for (const x of [
    -(product.width / 2 - 0.065 / 2),
    product.width / 2 - 0.065 / 2,
  ]) {
    rod(seating, [x * 0.8, 0.47, 0], [x, 0.65, 0], 0.018, "dark");
    box(
      seating,
      [0.065, 0.04, 0.26],
      [x, seatHeight + 0.18 - 0.02 - seating.position.y, 0],
      "dark",
    );
  }
  if (ergonomic) {
    const headY = product.height - 0.075 - seating.position.y;
    box(seating, [0.25, 0.15, 0.075], [0, headY, -0.23], "dark", 0.04);
    rod(seating, [0, 0.93, -0.22], [0, headY - 0.07, -0.25]);
    for (let i = 0; i < 7; i++)
      box(
        seating,
        [0.35, 0.008, 0.005],
        [0, 0.63 + i * 0.045, -0.159],
        "metal",
        0.003,
      );
  }
  return g;
}
function monitor(product) {
  const { width: w, depth: d, height: h, screen } = product;
  const g = new T.Group();
  const screenH = (screen.inches * 0.0254) / Math.sqrt(screen.aspect ** 2 + 1);
  const screenW = screenH * screen.aspect;
  const panelH = screenH + 0.024;
  const centerY = h - panelH / 2;
  box(g, [0.25, 0.018, d], [0, 0.009, 0], "metal");
  box(g, [0.034, centerY - 0.018, 0.033], [0, (centerY + 0.018) / 2, -0.025]);
  box(g, [w, panelH, 0.03], [0, centerY, 0], "dark", 0.012);
  const screenMat = new T.MeshStandardMaterial({
    color: "#23463b",
    roughness: 0.8,
    emissive: "#18372c",
    emissiveIntensity: 0.25,
  });
  screenMat.name = "screen";
  const display = new T.Group();
  display.position.y = centerY - 0.265;
  g.add(display);
  const active = box(
    g,
    [screenW, screenH, 0.003],
    [0, centerY, 0.017],
    screenMat,
    0.001,
  );
  active.name = "active-screen";
  const colors = ["#d2e891", "#96bdb1", "#8aa19b"];
  for (let i = 0; i < 3; i++) {
    const m = new T.MeshStandardMaterial({
      color: colors[i],
      emissive: colors[i],
      emissiveIntensity: 0.15,
    });
    box(
      display,
      [w * (i === 0 ? 0.4 : 0.3), 0.008, 0.002],
      [-w * 0.2, 0.36 - i * 0.026, 0.02],
      m,
      0.002,
    );
  }
  box(
    display,
    [w * 0.27, 0.16, 0.002],
    [w * 0.25, 0.259, 0.02],
    new T.MeshStandardMaterial({ color: "#74966e" }),
    0.006,
  );
  for (let i = 0; i < 4; i++)
    box(
      display,
      [w * 0.42, 0.006, 0.003],
      [-w * 0.2, 0.245 - i * 0.023, 0.021],
      new T.MeshStandardMaterial({ color: i % 2 ? "#d4ac7a" : "#91b8ab" }),
      0.002,
    );
  return g;
}
function lamp(product) {
  const g = new T.Group();
  const { width: w, depth: d, height: h } = product;
  // Mi LED 1S opened posture, forward along +Z. The origin is the envelope center.
  const baseZ = -d / 2 + w / 2;
  cyl(g, w / 2, 0.022, [0, 0.011, baseZ], "metal");
  box(
    g,
    [0.012, h - 0.033, 0.012],
    [0, (h - 0.033) / 2 + 0.022, baseZ],
    "metal",
    0.004,
  );
  box(
    g,
    [0.0225, 0.012, 0.426],
    [0, h - 0.006, d / 2 - 0.426 / 2],
    "metal",
    0.003,
  );
  box(
    g,
    [0.014, 0.003, 0.224],
    [0, h - 0.0135, d / 2 - 0.112 - 0.018],
    "cream",
    0.001,
  );
  cyl(g, 0.012, 0.014, [0, 0.029, baseZ + 0.04], "dark");
  return g;
}
function plant() {
  const g = new T.Group();
  cyl(g, 0.063, 0.13, [0, 0.065, 0], "pot", 0.078);
  cyl(g, 0.07, 0.008, [0, 0.128, 0], "dark");
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4,
      x = Math.sin(a) * 0.08,
      z = Math.cos(a) * 0.07,
      y = 0.19 + (i % 3) * 0.035;
    rod(g, [0, 0.12, 0], [x, y, z], 0.003, "green");
    sphere(
      g,
      [0.035, 0.085, 0.015],
      [x, y + 0.03, z],
      "green",
      Math.sin(a) * 0.65,
    );
  }
  return g;
}
function stand() {
  const g = new T.Group();
  for (const x of [-0.09, 0.09]) {
    rod(g, [x, 0.008, 0.09], [x, 0.13, -0.08], 0.016, "metal");
    box(g, [0.035, 0.013, 0.22], [x, 0.01, 0]);
  }
  const top = box(g, [0.28, 0.018, 0.24], [0, 0.135, 0], "metal");
  top.rotation.x = -0.25;
  box(g, [0.28, 0.025, 0.017], [0, 0.102, 0.118]);
  return g;
}
const models = {
  "electric-desk": desk(catalog["electric-desk"]),
  "wooden-desk": desk(catalog["wooden-desk"], false),
  "ergonomic-chair": chair(catalog["ergonomic-chair"]),
  "task-chair": chair(catalog["task-chair"], false),
  "monitor-27": monitor(catalog["monitor-27"]),
  "monitor-34": monitor(catalog["monitor-34"]),
  "desk-lamp": lamp(catalog["desk-lamp"]),
  plant: plant(),
  "laptop-stand": stand(),
};
await mkdir("public/models", { recursive: true });
const manifest = {
  schemaVersion: 2,
  units: "meters",
  upAxis: "Y",
  origin: "bottom-center",
  assets: {},
};
for (const [id, model] of Object.entries(models)) {
  const product = catalog[id];
  // Calibrate the generated envelope against the same catalogue used by placement.
  // Chair Y is constructed around its seat anchor and must never be stretched.
  model.updateMatrixWorld(true);
  const size = new T.Box3().setFromObject(model, true).getSize(new T.Vector3());
  model.scale.set(
    product.width / size.x,
    product.category === "chair" ? 1 : product.height / size.y,
    product.depth / size.z,
  );
  model.updateMatrixWorld(true);
  const envelope = new T.Box3().setFromObject(model, true);
  model.position.set(
    -(envelope.min.x + envelope.max.x) / 2,
    -envelope.min.y,
    -(envelope.min.z + envelope.max.z) / 2,
  );
  model.name = id;
  const scene = new T.Scene();
  scene.add(model);
  scene.updateMatrixWorld(true);
  const bytes = await new GLTFExporter().parseAsync(scene, { binary: true });
  await writeFile(`public/models/${id}.glb`, Buffer.from(bytes));
  const bounds = new T.Box3().setFromObject(model, true);
  let triangles = 0;
  model.traverse((o) => {
    if (o.isMesh)
      triangles +=
        (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
  });
  manifest.assets[id] = {
    path: `/models/${id}.glb`,
    version: catalog[id].assetVersion ?? 1,
    method: "parametric-original",
    family: id.endsWith("-desk")
      ? "desk"
      : id.includes("chair")
        ? "chair"
        : id.includes("monitor")
          ? "monitor"
          : id,
    bytes: bytes.byteLength,
    triangles,
    bounds: bounds.getSize(new T.Vector3()).toArray(),
    scale: product.scale,
    dimensions: {
      width: product.width,
      depth: product.depth,
      height: product.height,
      seatHeight: product.seatHeight,
    },
    review: "approved-stylized",
  };
  console.log(
    `${id}: ${(bytes.byteLength / 1024).toFixed(0)} KB / ${triangles} triangles`,
  );
}
await writeFile(
  "public/models/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
