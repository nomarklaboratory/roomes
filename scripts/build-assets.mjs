import * as T from "three";
import {
  jarvis,
  chair,
  monitor,
  wit,
  fejka,
  curve,
  surfboard,
} from "./product-models.mjs";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { catalog } from "../lib/catalog.ts";
import { mat, keyboard, mouse, controller } from "./desk-accessory-models.mjs";

const accessoryBuilders = {
  monitor,
  lamp: wit,
  plant: fejka,
  stand: curve,
  surfboard,
  "desk-mat": mat,
  "mouse-pad": mat,
  keyboard,
  mouse,
  controller,
};

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
const target = process.argv[2];
if (target && !catalog[target]) throw new Error(`Unknown product: ${target}`);
const models = Object.fromEntries(
  Object.values(catalog)
    .filter((product) => !target || product.id === target)
    .map((product) => {
      if (product.category === "desk") return [product.id, jarvis(product)];
      if (product.category === "chair")
        return [
          product.id,
          chair(product, product.id === "herman-miller-aeron"),
        ];
      const build = accessoryBuilders[product.kind];
      if (!build) throw new Error(`Missing model builder: ${product.id}`);
      return [product.id, build(product)];
    }),
);
await mkdir("public/models", { recursive: true });
const manifest = target
  ? JSON.parse(await readFile("public/models/manifest.json", "utf8"))
  : {
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
    family: product.kind ?? product.category,
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
    review: "stylized-product-reference",
  };
  console.log(
    `${id}: ${(bytes.byteLength / 1024).toFixed(0)} KB / ${triangles} triangles`,
  );
}
await writeFile(
  "public/models/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
