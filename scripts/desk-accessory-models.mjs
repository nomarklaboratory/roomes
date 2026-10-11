import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const material = (name, color, roughness = 0.8) => {
  const value = new T.MeshStandardMaterial({ color, roughness });
  value.name = name;
  return value;
};
const graphite = material("graphite-case", "#343536");
const keys = material("graphite-keycaps", "#525354");
const rubber = material("rubber-base", "#232426");
const silver = material("metal-scroll-wheel", "#a6a9ad", 0.35);

function box(group, size, position, surface, radius = 0) {
  const shape = radius
    ? new RoundedBoxGeometry(
        ...size,
        1,
        Math.min(radius, ...size.map((n) => n / 2)),
      )
    : new T.BoxGeometry(...size);
  const mesh = new T.Mesh(shape, surface);
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

export function mat(product) {
  const group = new T.Group();
  const fabric = material(
    "stitched-fabric",
    product.kind === "desk-mat" ? "#97999b" : "#9c697a",
    1,
  );
  const { width, depth, height } = product;
  box(group, [width, height / 2, depth], [0, height / 4, 0], rubber, 0.001);
  box(group, [width, height / 2, depth], [0, height * 0.75, 0], fabric, 0.001);
  const stitch = material(
    "stitched-edge",
    product.kind === "desk-mat" ? "#b6b6b7" : "#b88997",
  );
  for (const side of [-1, 1]) {
    box(
      group,
      [width - 0.012, 0.0001, 0.0006],
      [0, height + 0.00005, side * (depth / 2 - 0.004)],
      stitch,
    );
    box(
      group,
      [0.0006, 0.0001, depth - 0.012],
      [side * (width / 2 - 0.004), height + 0.00005, 0],
      stitch,
    );
  }
  return group;
}

export function keyboard(product) {
  const group = new T.Group();
  box(
    group,
    [product.width, 0.016, product.depth],
    [0, 0.008, 0],
    graphite,
    0.007,
  );
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 14; column++) {
      box(
        group,
        [0.017, 0.004, 0.017],
        [(column - 6.5) * 0.0202, 0.018, (row - 2.5) * 0.02],
        keys,
        0.001,
      );
    }
  }
  for (const x of [-0.127, -0.106, -0.085, 0.085, 0.106, 0.127])
    box(group, [0.017, 0.004, 0.017], [x, 0.018, 0.05], keys, 0.001);
  box(group, [0.14, 0.004, 0.017], [0, 0.018, 0.05], keys, 0.001);
  return group;
}

export function mouse(product) {
  const group = new T.Group();
  const { width, depth, height } = product;
  box(group, [width, 0.009, depth * 0.9], [0, 0.0045, 0], rubber, 0.004);
  const body = new T.Mesh(new T.SphereGeometry(1, 20, 12), graphite);
  body.scale.set(width * 0.38, height * 0.43, depth / 2);
  body.position.set(width * 0.1, height * 0.54, 0);
  group.add(body);
  box(
    group,
    [width * 0.36, height * 0.22, depth * 0.65],
    [-width * 0.32, height * 0.15, depth * 0.07],
    graphite,
    0.004,
  );
  const wheel = new T.Mesh(
    new T.CylinderGeometry(0.007, 0.007, 0.009, 16),
    silver,
  );
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(width * 0.1, height * 0.91, -depth * 0.22);
  group.add(wheel);
  box(
    group,
    [0.001, 0.001, depth * 0.28],
    [width * 0.1, height * 0.92, -depth * 0.29],
    rubber,
  );
  return group;
}

export function controller(product) {
  const group = new T.Group();
  box(
    group,
    [product.width, product.height, product.depth],
    [0, product.height / 2, 0],
    graphite,
    0.005,
  );
  const screen = material("lcd-key", "#18212b", 0.3);
  const colors = ["#88a5cd", "#73ac92", "#b399c5", "#c9a977", "#9aa8ad"];
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 5; column++) {
      const x = (column - 2) * 0.021,
        z = (row - 1) * 0.022;
      box(group, [0.017, 0.002, 0.018], [x, product.height, z], screen, 0.001);
      const icon = material(
        `lcd-icon-${row}-${column}`,
        colors[(row + column) % colors.length],
      );
      box(group, [0.008, 0.0002, 0.006], [x, product.height + 0.0012, z], icon);
    }
  }
  return group;
}
