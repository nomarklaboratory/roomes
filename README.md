# Workspace Studio for monis.rent

An interactive Bali workspace designer: choose a room, swap desks and chairs, arrange your setup in 3D, walk inside it, and review a simulated rental.

**Live:** https://roomes-lac.vercel.app

**Source:** https://github.com/nomarklaboratory/roomes

## Approach

The hard part is helping someone picture a complete setup quickly. Three editable room presets give them a useful starting point, and a large cutaway room makes each selection tangible. Drag furniture across the room and accessories across the tabletop, or use precise movement buttons. The desk carries its accessories, positions stay within their surfaces, and each completed drag creates one undo step. Quick placement slots and deterministic reflow still handle smaller desks and incompatible monitor combinations.

Next.js App Router and Tailwind CSS provide the interface; React Three Fiber, Drei, and Three.js render original, reusable GLB models. The catalog and configuration rules are independent of the renderer. A reducer handles history, integer-cent quotes, and versioned device storage, including layouts migrated from earlier saves. The renderer loads on the client, renders on demand outside first-person mode, bounds its pixel density, and falls back to an updating 2D illustration if WebGL is unavailable. First-person navigation uses a separate eye-level camera with room and furniture collision bounds; it supports drag-to-look, keyboard walking, and touch controls without requiring pointer lock.

## Try it

- Pick Essentials, Deep focus (Developer), or Room to create (Creative).
- Choose from two desks and two chairs, and change the tabletop finish.
- Add monitors, a lamp, a plant, or a laptop stand. Up to two monitors must fit the desk; other extras are limited to one each.
- Drag any setup item in the preview. Use Top for easier placement, or select a chip below the preview for movement buttons and position reset. Furniture moves in 10 cm steps; accessories in 2 cm steps. Undo and device saving include positions.
- Choose **Inside** for first-person viewing. Drag to look; use WASD, arrow keys, or hold the onscreen direction buttons to walk. Recenter restores the starting viewpoint; Exit view or Escape returns to the room overview.
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

Domain tests exercise placement bounds, layout migration and undo, walking collisions, fit/reflow, quantities and occupied slots, grouped quotes, corrupted persistence, and date boundaries. Browser tests cover real mouse/touch dragging, precise moves, layout persistence, first-person navigation and exit, the complete rental flow, presets/finishes, desktop/mobile layouts, 3D readiness, the help dialog, and a device without WebGL. The public Vercel URL was also checked anonymously on desktop and mobile. Tests retain traces on failure and capture the editor, first-person view, and confirmation for visual inspection.

## Sustainable asset workflow

The entire approved catalog uses original parametric models with reusable families and runtime material variants. Thumbnails are rendered in Blender. A manifest records bounds, versions, provenance, and budgets. The optional, bounded Meshy pilot was skipped because no credentials were configured; no credits were spent. AI generation happens offline, followed by optimization, dimension calibration, and human approval.

See [asset workflow and pilot](docs/assets.md) for reproducible commands and the production pipeline. The agreed epics and scaling roadmap are in [.plan/epics.md](.plan/epics.md).

## With more time

Connect authoritative inventory, date availability, delivery pricing, and server-side quotes before taking bookings. Validate product dimensions and asset fidelity with the client, expand the sample to representative real SKUs, and test performance on low-end phones. Then introduce asynchronous asset jobs, human review/version rollback, and a real commerce integration. Extend placement with rotation, furniture-to-furniture collision checks, and custom room dimensions; the current room bounds are illustrative. Room scanning remains a separate product bet.

## Submission

Next.js · Tailwind CSS · Vercel. Public GitHub repository; `desent-bot` was invited with **Read** access on 10 October 2026. Acceptance is controlled by the bot.
