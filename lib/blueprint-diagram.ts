import type { BlueprintView } from "../types/blueprint.ts";

export function diagramGeometry(view: BlueprintView) {
  const scale = Math.min(740 / view.width, 410 / view.height);
  const width = view.width * scale;
  const height = view.height * scale;
  return {
    scale,
    x: (960 - width) / 2,
    y: 100 + (410 - height) / 2,
    width,
    height,
  };
}
