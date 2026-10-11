"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three";
import { clampPosition, productFor } from "@/lib/placement";
import { catalog } from "@/lib/catalog";
import { useEditorStore } from "@/components/studio-provider";
import type { Setup } from "@/types/workspace";
import type {
  ProductMoveController,
  ProductMoveSession,
  ProductPointer,
} from "@/types/product-interaction";

export function useProductPlacement(
  setup: Setup,
  { getSession, update, confirm, cancel }: ProductMoveController,
) {
  const get = useThree((state) => state.get);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const intersection = new Vector3();
    const offset = new Vector3();
    const plane = new Plane();
    let anchor: ProductPointer | null = null;
    let touchPointer: number | null = null;

    const intersect = (event: ProductPointer) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, get().camera);
      return raycaster.ray.intersectPlane(plane, intersection);
    };
    const alignPointer = (move: ProductMoveSession, event: ProductPointer) => {
      const furniture = move.id === "desk" || move.id === "chair";
      const wall = productFor(setup, move.id)?.mount === "back-wall";
      const y = furniture ? 0 : catalog[setup.deskId].height;
      const desk = furniture || wall ? { x: 0, z: 0 } : setup.layout.desk;
      const world = new Vector3(
        move.position.x + desk.x,
        move.position.y ?? y,
        move.position.z + desk.z,
      );
      plane.setFromNormalAndCoplanarPoint(
        wall ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0),
        world,
      );
      const hit = intersect(event);
      if (hit) offset.copy(hit).sub(world);
      return hit !== null;
    };
    const positionAtPointer = (event: PointerEvent) => {
      const move = getSession();
      if (!move) return;
      if (anchor !== move.anchor) {
        if (!alignPointer(move, move.anchor)) return;
        anchor = move.anchor;
      }
      const hit = intersect(event);
      if (!hit) return;
      const furniture = move.id === "desk" || move.id === "chair";
      const wall = productFor(setup, move.id)?.mount === "back-wall";
      const desk = furniture || wall ? { x: 0, z: 0 } : setup.layout.desk;
      update(
        clampPosition(setup, move.id, {
          x: hit.x - offset.x - desk.x,
          z: hit.z - offset.z - desk.z,
          ...(wall ? { y: hit.y - offset.y } : {}),
        }),
      );
    };
    const blockCamera = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const down = (event: PointerEvent) => {
      const move = getSession();
      if (!move) return;
      blockCamera(event);
      if (!event.isPrimary || event.button !== 0) return;
      if (event.pointerType === "mouse") {
        positionAtPointer(event);
        confirm();
        return;
      }
      if (touchPointer !== null) return;
      anchor = move.anchor;
      if (!alignPointer(move, event)) return;
      touchPointer = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!getSession()) return;
      blockCamera(event);
      if (event.pointerType !== "mouse" && touchPointer !== event.pointerId)
        return;
      positionAtPointer(event);
    };
    const up = (event: PointerEvent) => {
      if (touchPointer !== event.pointerId) return;
      touchPointer = null;
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
    };
    const abort = (event: PointerEvent) => {
      if (touchPointer !== event.pointerId) return;
      up(event);
      cancel();
    };
    const contextMenu = (event: MouseEvent) => {
      if (!getSession()) return;
      blockCamera(event);
      cancel();
    };
    const wheel = (event: WheelEvent) => {
      if (getSession()) blockCamera(event);
    };
    canvas.addEventListener("pointerdown", down, true);
    canvas.addEventListener("pointermove", move, true);
    canvas.addEventListener("pointerup", up, true);
    canvas.addEventListener("pointercancel", abort, true);
    canvas.addEventListener("contextmenu", contextMenu, true);
    canvas.addEventListener("wheel", wheel, { capture: true, passive: false });
    return () => {
      canvas.removeEventListener("pointerdown", down, true);
      canvas.removeEventListener("pointermove", move, true);
      canvas.removeEventListener("pointerup", up, true);
      canvas.removeEventListener("pointercancel", abort, true);
      canvas.removeEventListener("contextmenu", contextMenu, true);
      canvas.removeEventListener("wheel", wheel, true);
      if (touchPointer !== null && canvas.hasPointerCapture(touchPointer))
        canvas.releasePointerCapture(touchPointer);
    };
  }, [getSession, cancel, confirm, get, gl, setup, update]);

  const movingId = useEditorStore((state) => state.session?.id);
  useEffect(() => {
    const canvas = gl.domElement;
    if (!movingId) return;
    canvas.setAttribute("data-moving", movingId);
    canvas.style.setProperty("cursor", "move");
    return () => {
      canvas.removeAttribute("data-moving");
      canvas.style.removeProperty("cursor");
    };
  }, [gl, movingId]);
}
