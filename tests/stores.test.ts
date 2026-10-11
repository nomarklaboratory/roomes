import { test } from "node:test";
import assert from "node:assert/strict";
import { createEditorStore, cameraLocked } from "../lib/stores/editor-store.ts";
import {
  connectWorkspaceStorage,
  createWorkspaceStore,
} from "../lib/stores/workspace-store.ts";
import { presetSetup, STORAGE_KEY, STORAGE_VERSION } from "../lib/workspace.ts";

function memoryStorage(raw: string | null = null) {
  const writes: string[] = [];
  return {
    writes,
    getItem: (key: string) => {
      assert.equal(key, STORAGE_KEY);
      return raw;
    },
    setItem: (key: string, value: string) => {
      assert.equal(key, STORAGE_KEY);
      raw = value;
      writes.push(value);
    },
  };
}

test("studio instances have independent workspace and editor state with deterministic initial snapshots", () => {
  const first = createWorkspaceStore();
  const second = createWorkspaceStore();
  const editor = createEditorStore();
  const otherEditor = createEditorStore();
  assert.deepEqual(
    first.getInitialState().history,
    second.getInitialState().history,
  );
  assert.equal(first.getInitialState().loaded, false);
  first.getState().change({ type: "weeks", value: 8 });
  editor.getState().sitInChair();
  assert.equal(second.getState().history.present.weeks, 4);
  assert.equal(first.getInitialState().history.present.weeks, 4);
  assert.equal(otherEditor.getState().view, "room");
  assert.equal(otherEditor.getState().posture, "standing");
});

for (const version of [1, 2, 3]) {
  test(`existing version ${version} saves hydrate before the first write and retain the original envelope`, () => {
    const setup = { ...presetSetup("creative"), weeks: 8 as const };
    const storage = memoryStorage(JSON.stringify({ version, setup }));
    const store = createWorkspaceStore();
    assert.equal(storage.writes.length, 0);
    const disconnect = connectWorkspaceStorage(store, () => storage);
    assert.equal(store.getState().loaded, true);
    assert.deepEqual(store.getState().history.present, setup);
    assert.equal(store.getState().history.past.length, 0);
    const saved = JSON.parse(storage.writes[0]);
    assert.equal(saved.version, STORAGE_VERSION);
    assert.deepEqual(saved.setup, setup);
    assert.equal(saved.state, undefined);
    disconnect();
  });
}

test("movement drafts and camera controls never write workspace storage or create undo entries", () => {
  const workspace = createWorkspaceStore();
  const editor = createEditorStore();
  const storage = memoryStorage();
  const disconnect = connectWorkspaceStorage(workspace, () => storage);
  const original = workspace.getState().history;
  const writes = storage.writes.length;
  editor.getState().hold("chair");
  editor
    .getState()
    .beginMove(
      "chair",
      { x: 0, z: 0.35 },
      { clientX: 100, clientY: 100, pointerType: "mouse" },
    );
  editor.getState().releaseHold("chair");
  assert.equal(cameraLocked(editor.getState()), true);
  for (let i = 0; i < 100; i++)
    editor.getState().updateMove({ x: i / 100, z: 0.35 });
  editor.getState().cancelMove();
  editor.getState().sitInChair();
  editor.getState().setPreviewExpanded(true);
  assert.equal(storage.writes.length, writes);
  assert.equal(workspace.getState().history, original);
  assert.equal(cameraLocked(editor.getState()), false);
  workspace
    .getState()
    .change({ type: "place", id: "chair", position: { x: 0.3, z: 0.35 } });
  assert.equal(storage.writes.length, writes + 1);
  assert.equal(workspace.getState().history.past.length, 1);
  workspace.getState().change({ type: "undo" });
  assert.deepEqual(workspace.getState().history.present, original.present);
  disconnect();
  workspace.getState().change({ type: "weeks", value: 8 });
  assert.equal(storage.writes.length, writes + 2);
});

test("read or write failures leave a usable in-memory workspace without recursive writes", () => {
  const blocked = createWorkspaceStore();
  const disconnectBlocked = connectWorkspaceStorage(blocked, () => {
    throw new Error("Storage unavailable");
  });
  assert.equal(blocked.getState().loaded, true);
  assert.equal(blocked.getState().storageWarning, true);
  blocked.getState().change({ type: "weeks", value: 8 });
  assert.equal(blocked.getState().history.present.weeks, 8);
  disconnectBlocked();

  const quota = createWorkspaceStore();
  let attempts = 0;
  const disconnectQuota = connectWorkspaceStorage(quota, () => ({
    getItem: () => null,
    setItem: () => {
      attempts++;
      throw new Error("Quota exceeded");
    },
  }));
  assert.equal(attempts, 1);
  assert.equal(quota.getState().storageWarning, true);
  quota.getState().change({ type: "weeks", value: 8 });
  assert.equal(attempts, 2);
  disconnectQuota();
});

test("view changes cancel unfinished movement and seating coordinates posture and selection", () => {
  const store = createEditorStore();
  store.getState().select("chair");
  store
    .getState()
    .beginMove(
      "chair",
      { x: 0, z: 0.35 },
      { clientX: 100, clientY: 100, pointerType: "touch" },
    );
  store.getState().sitInChair();
  assert.equal(store.getState().view, "walk");
  assert.equal(store.getState().posture, "seated");
  assert.equal(store.getState().selected, null);
  assert.equal(store.getState().session, null);
  store.getState().setView("room");
  store.getState().setView("walk");
  assert.equal(store.getState().posture, "standing");
});
