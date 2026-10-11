import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog } from "../lib/catalog.ts";
import { defaultRentalBrief, recommendSetup } from "../lib/rental-brief.ts";
import {
  parseRentalBrief,
  rentalBriefDraft,
} from "../lib/rental-brief-form.ts";
import {
  connectRentalBriefStorage,
  createRentalBriefStore,
  ONBOARDING_KEY,
} from "../lib/stores/rental-brief-store.ts";
import {
  connectWorkspaceStorage,
  createWorkspaceStore,
} from "../lib/stores/workspace-store.ts";
import {
  initialHistory,
  presetSetup,
  quote,
  reducer,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "../lib/workspace.ts";
import { rentalRequest } from "../lib/checkout.ts";
import type { ScreenPreference, WorkStyle } from "../types/rental-brief.ts";

test("work presets and explicit screen preferences always produce complete, dimension-safe setups", () => {
  const styles: WorkStyle[] = ["everyday", "coding", "creative"];
  const screens: ScreenPreference[] = [
    "recommend",
    "none",
    "standard",
    "wide",
    "dual",
  ];
  for (const workStyle of styles)
    for (const preference of screens) {
      const brief = {
        ...defaultRentalBrief(),
        workStyle,
        screens: preference,
        weeks: 8 as const,
      };
      const result = recommendSetup(brief);
      assert.deepEqual(result, recommendSetup(brief));
      assert.equal(catalog[result.setup.deskId].category, "desk");
      assert.equal(catalog[result.setup.chairId].category, "chair");
      const monitors = result.setup.items.filter(
        (item) => catalog[item.productId].kind === "monitor",
      );
      const expected =
        preference === "recommend"
          ? Number(workStyle !== "everyday")
          : preference === "none"
            ? 0
            : preference === "dual"
              ? 2
              : 1;
      assert.equal(monitors.length, expected);
      if (preference === "dual")
        assert.equal(result.setup.deskId, "jarvis-laminate");
      if (preference === "wide")
        assert.equal(monitors[0].productId, "dell-u3425we");
      assert.ok(
        monitors.reduce((sum, item) => sum + catalog[item.productId].width, 0) +
          Math.max(0, monitors.length - 1) * 0.04 <=
          catalog[result.setup.deskId].width,
      );
      assert.equal(result.totalCents, quote(result.setup).weeklyCents * 8);
      assert.equal(result.budgetShortfallCents, 0);
    }
  assert.equal(
    recommendSetup({ ...defaultRentalBrief(), workStyle: "coding" })
      .weeklyCents,
    2700,
  );
  assert.equal(
    recommendSetup({ ...defaultRentalBrief(), workStyle: "creative" })
      .weeklyCents,
    3400,
  );
});

test("budget matching adjusts optional items and furniture but never discards requested screens", () => {
  const affordable = recommendSetup({
    ...defaultRentalBrief(),
    workStyle: "coding",
    weeklyBudgetCents: 2300,
  });
  assert.equal(affordable.weeklyCents, 2200);
  assert.equal(affordable.setup.chairId, "herman-miller-sayl");
  assert.equal(affordable.setup.items.length, 1);
  const impossible = recommendSetup({
    ...defaultRentalBrief(),
    workStyle: "coding",
    screens: "dual",
    weeklyBudgetCents: 3000,
  });
  assert.equal(impossible.weeklyCents, 3700);
  assert.equal(impossible.budgetShortfallCents, 700);
  assert.equal(
    impossible.setup.items.filter(
      (item) => catalog[item.productId].kind === "monitor",
    ).length,
    2,
  );
  const generous = recommendSetup({
    ...defaultRentalBrief(),
    workStyle: "creative",
    weeklyBudgetCents: 10000,
  });
  assert.equal(generous.setup.chairId, "herman-miller-sayl");
  assert.equal(generous.setup.items.length, 3);
});

test("applying the brief preserves room dimensions and restores a customized room with one undo", () => {
  let state = reducer(initialHistory(), {
    type: "room",
    dimensions: { width: 4.8, depth: 4, height: 3 },
  });
  state = reducer(state, {
    type: "place",
    id: "chair",
    position: { x: 0.45, z: 0.6 },
  });
  state = reducer(state, {
    type: "add",
    id: "my-board",
    productId: "torq-mod-fun",
  });
  const before = state;
  const result = recommendSetup(defaultRentalBrief(), state.present.room);
  assert.deepEqual(result.setup.room, before.present.room);
  state = reducer(state, { type: "apply-brief", setup: result.setup });
  assert.equal(state.past.length, before.past.length + 1);
  assert.deepEqual(reducer(state, { type: "undo" }).present, before.present);
  const measured = { width: 2.8, depth: 3, height: 2.4 };
  assert.deepEqual(
    recommendSetup({ ...defaultRentalBrief(), room: measured }).setup.room,
    measured,
  );
});

test("optional answers and valid decimals parse, while past dates, invalid budgets and rooms are rejected", () => {
  const draft = rentalBriefDraft(presetSetup("developer"), null, false);
  assert.equal(draft.workStyle, "everyday");
  assert.deepEqual(parseRentalBrief(draft).errors, {});
  assert.equal(
    parseRentalBrief({ ...draft, budget: "22.15" }).brief.weeklyBudgetCents,
    2215,
  );
  for (const budget of ["0", "-1", "NaN", "1.001", "1e3", "Infinity"])
    assert.ok(parseRentalBrief({ ...draft, budget }).errors.budget);
  assert.ok(parseRentalBrief({ ...draft, date: "2000-01-01" }).errors.date);
  assert.ok(parseRentalBrief({ ...draft, date: "2099-02-30" }).errors.date);
  const invalid = {
    ...draft,
    measureRoom: true,
    dimensions: { width: "", depth: "11", height: "2" },
  };
  assert.deepEqual(Object.keys(parseRentalBrief(invalid).errors), [
    "width",
    "depth",
    "height",
  ]);
  assert.deepEqual(
    parseRentalBrief({ ...invalid, measureRoom: false }).errors,
    {},
  );
  const latest = rentalBriefDraft(
    { ...presetSetup("creative"), weeks: 8 },
    { ...defaultRentalBrief(), weeks: 1 },
    true,
  );
  assert.equal(latest.weeks, 8);
});

function memoryStorage(entries: Record<string, string> = {}) {
  const values = new Map(Object.entries(entries));
  const writes: { key: string; value: string }[] = [];
  return {
    values,
    writes,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
      writes.push({ key, value });
    },
  };
}

test("pending onboarding is saved before workspace defaults and survives reload; only completion status persists", () => {
  const storage = memoryStorage();
  const store = createRentalBriefStore();
  const other = createRentalBriefStore();
  assert.equal(store.getInitialState().status, "loading");
  const disconnect = connectRentalBriefStorage(store, () => storage);
  const disconnectWorkspace = connectWorkspaceStorage(
    createWorkspaceStore(),
    () => storage,
  );
  assert.equal(storage.writes[0].key, ONBOARDING_KEY);
  assert.equal(store.getState().step, "brief");
  const reload = createRentalBriefStore();
  const disconnectReload = connectRentalBriefStorage(reload, () => storage);
  assert.equal(reload.getState().status, "pending");
  const brief = {
    ...defaultRentalBrief(),
    area: "Canggu",
    date: "2099-01-02",
    laptopConnection: "hdmi" as const,
    weeklyBudgetCents: 2300,
  };
  store.getState().commit(brief);
  assert.deepEqual(JSON.parse(storage.values.get(ONBOARDING_KEY)!), {
    version: 1,
    status: "complete",
  });
  const writes = storage.writes.length;
  store.getState().open();
  store.getState().updateDelivery("area", "Uluwatu");
  assert.equal(storage.writes.length, writes);
  assert.equal(other.getState().brief, null);
  assert.ok(!JSON.stringify([...storage.values]).includes("Canggu"));
  assert.ok(!JSON.stringify([...storage.values]).includes("2099-01-02"));
  assert.ok(!JSON.stringify([...storage.values]).includes("hdmi"));
  const returning = createRentalBriefStore();
  const disconnectReturning = connectRentalBriefStorage(
    returning,
    () => storage,
  );
  assert.equal(returning.getState().status, "complete");
  assert.equal(returning.getState().step, "design");
  assert.equal(returning.getState().brief, null);
  store.getState().clear();
  assert.equal(store.getState().brief, null);
  disconnect();
  disconnectWorkspace();
  disconnectReload();
  disconnectReturning();
});

test("saved workspaces require onboarding until completion or skip and stay intact", () => {
  for (const version of [1, 2, 3]) {
    const setup = presetSetup("creative");
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        version,
        setup,
      }),
    });
    const store = createRentalBriefStore();
    const workspace = createWorkspaceStore();
    const disconnect = connectRentalBriefStorage(store, () => storage);
    const disconnectWorkspace = connectWorkspaceStorage(
      workspace,
      () => storage,
    );
    assert.equal(store.getState().status, "pending");
    assert.equal(store.getState().step, "brief");
    assert.equal(store.getState().brief, null);
    assert.deepEqual(workspace.getState().history.present, setup);
    store.getState().skip();
    assert.deepEqual(workspace.getState().history.present, setup);
    const returning = createRentalBriefStore();
    const disconnectReturning = connectRentalBriefStorage(
      returning,
      () => storage,
    );
    assert.equal(returning.getState().step, "design");
    disconnect();
    disconnectWorkspace();
    disconnectReturning();
  }
});

test("corrupted onboarding data and blocked storage keep the brief skippable", () => {
  for (const marker of [
    "{",
    "null",
    JSON.stringify({ version: 1, status: "invented" }),
  ]) {
    const store = createRentalBriefStore();
    const disconnect = connectRentalBriefStorage(store, () =>
      memoryStorage({ [ONBOARDING_KEY]: marker }),
    );
    assert.equal(store.getState().status, "pending");
    disconnect();
  }
  const blocked = createRentalBriefStore();
  const disconnect = connectRentalBriefStorage(blocked, () => {
    throw new Error("Blocked");
  });
  assert.equal(blocked.getState().storageWarning, true);
  blocked.getState().skip();
  assert.equal(blocked.getState().step, "design");
  disconnect();
  let attempts = 0;
  const quota = createRentalBriefStore();
  const disconnectQuota = connectRentalBriefStorage(quota, () => ({
    getItem: () => null,
    setItem: () => {
      attempts++;
      throw new Error("Quota");
    },
  }));
  assert.equal(attempts, 1);
  quota.getState().skip();
  assert.equal(attempts, 2);
  disconnectQuota();
  quota.getState().commit(defaultRentalBrief());
  assert.equal(attempts, 2);
});

test("explicit request downloads include connection preferences without claiming compatibility", () => {
  const brief = {
    ...defaultRentalBrief(),
    workStyle: "coding" as const,
    laptopConnection: "usb-c" as const,
    weeklyBudgetCents: 2700,
  };
  const setup = recommendSetup(brief).setup;
  const request = rentalRequest(
    setup,
    {
      name: "Alex",
      email: "alex@example.com",
      phone: "+62",
      area: "Canggu",
      address: "Villa",
      date: "2099-01-02",
      notes: "",
    },
    brief,
  );
  assert.equal(request.preferences?.laptopConnection, "usb-c");
  assert.equal(request.preferences?.compatibilityVerified, false);
  assert.equal(request.totalCents, quote(setup).totalCents);
  assert.equal(
    JSON.parse(JSON.stringify({ version: STORAGE_VERSION, setup })).setup.area,
    undefined,
  );
});
