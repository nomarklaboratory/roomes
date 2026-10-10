# Workspace Studio for monis.rent

An interactive Bali workspace designer: choose a room, swap desks and chairs, add the little extras, explore in 3D, and review a simulated rental.

**Live:** https://roomes-lac.vercel.app

**Source:** https://github.com/nomarklaboratory/roomes

## Approach

The hard part is helping someone picture a complete setup quickly. Three editable room presets give them a useful starting point, and a large cutaway room makes each selection tangible. Placement uses valid desk slots rather than free dragging, with deterministic reflow and undo when a smaller desk cannot hold the selected monitors.

Next.js App Router and Tailwind CSS provide the interface; React Three Fiber, Drei, and Three.js render original, reusable GLB models. The catalog and configuration rules are independent of the renderer. A reducer handles history, integer-cent quotes, and versioned device storage. The renderer loads on the client, renders on demand, bounds its pixel density, and falls back to an updating 2D illustration if WebGL is unavailable.

## Try it

- Pick Essentials, Deep focus (Developer), or Room to create (Creative).
- Choose from two desks and two chairs, and change the tabletop finish.
- Add monitors, a lamp, a plant, or a laptop stand. Up to two monitors must fit the desk; other extras are limited to one each.
- Tap an accessory below the preview to change its position; explore Room, Front, and Top camera views.
- Choose 1, 2, 4, or 8 weeks, review quantities and totals, then try the simulated request form.

All prices are **illustrative USD weekly rates**. Models are stylized product-inspired illustrations; dimensions and finishes do not constitute a fit or availability guarantee. The Everyday chair and plant are clearly labeled concepts. No payment, reservation, or booking request is sent. Name, area, and delivery date stay in React memory and are cleared after confirmation; only the product configuration is saved on the device. Delivery dates are checked against Bali's UTC+8 calendar.

## Run locally

Use Node.js 24+ and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

No account, backend, or environment variables are required to use the app.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
pnpm start
```

Domain tests exercise fit/reflow/undo, quantities and occupied slots, grouped quotes, corrupted persistence, and date boundaries. Browser tests cover the complete rental flow, presets/finishes, reload persistence, desktop/mobile layouts, 3D readiness, the help dialog, and a device without WebGL. The public Vercel URL was also checked anonymously on desktop and mobile. Tests retain traces on failure and capture the editor and confirmation for visual inspection.

## Sustainable asset workflow

The entire approved catalog uses original parametric models with reusable families and runtime material variants. Thumbnails are rendered in Blender. A manifest records bounds, versions, provenance, and budgets. The optional, bounded Meshy pilot was skipped because no credentials were configured; no credits were spent. AI generation happens offline, followed by optimization, dimension calibration, and human approval.

See [asset workflow and pilot](docs/assets.md) for reproducible commands and the production pipeline. The agreed epics and scaling roadmap are in [.plan/epics.md](.plan/epics.md).

## With more time

Connect authoritative inventory, date availability, delivery pricing, and server-side quotes before taking bookings. Validate product dimensions and asset fidelity with the client, expand the sample to representative real SKUs, and test performance on low-end phones. Then introduce asynchronous asset jobs, human review/version rollback, and a real commerce integration. Room scanning and arbitrary furniture dragging are separate product bets, not prerequisites for a dependable catalog-sized configurator.

## Submission

Next.js · Tailwind CSS · Vercel. Public GitHub repository; `desent-bot` was invited with **Read** access on 10 October 2026. Acceptance is controlled by the bot.
