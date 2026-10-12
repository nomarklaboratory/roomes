# Workspace Studio for monis.rent

An interactive Bali workspace designer: arrange real products in 3D, step inside the room, inspect official product photos and recorded films, and review a rental request on a dedicated checkout page.

**Published MVP:** https://roomes-lac.vercel.app

**Source:** https://github.com/nomarklaboratory/roomes

**Stack:** Next.js, Tailwind CSS, Vercel

## Approach and tech choices

I made the room preview the main workspace, with hold-and-slide product actions and a catalog modal that leaves more space for designing. React Three Fiber and Drei power the 3D experience, while official product photos help users inspect materials and a downloadable blueprint helps them recreate their saved layout. Next.js and TypeScript provide the app structure, Tailwind handles styling, Zustand manages the setup and undo history, and React Hook Form with Zod handles form validation; interaction logic lives in reusable hooks. With more time, I would connect real rental inventory and availability, validate product dimensions with the client, and improve performance on low-end phones before adding payments.

## Try it

On a first visit, fill the **rental brief** for an editable suggestion, or **Skip rental brief** to start designing. Monitor users can record a laptop connection preference; compatibility and cables still need verification. **Edit rental brief** reopens it. **Back to my setup** leaves the room untouched.

Choose from two desks and two chairs, and change the tabletop finish. Add monitors, a lamp, a plant, or a laptop stand. Up to two monitors must fit the desk. Accessories can be duplicated when another copy fits on their tabletop or wall surface. Desks and chairs stay one per setup.

Hold a setup item until the action wheel appears, then slide and release:

- **Duplicate** (up) adds another copy of that accessory. Copies get their own positions, count toward the quote, save on the device, and undo in one step. Duplicate is unavailable for furniture and when another copy cannot fit.
- **Move** (left) starts a draft. Drag, then click or tap **Place**. **Cancel** or Escape discards it. Use Top for placement. A chip below the preview opens movement buttons and position reset. Furniture and wall items move in 10 cm steps. Tabletop accessories move in 2 cm steps. Undo and device saving include positions.
- **Inspect** (right) opens that product's official media.
- **Delete** (down) asks for confirmation on accessories.

Moving before the hold completes cancels the action. **Inspect product** is the keyboard path and shows the selected item, or the desk by default. From there, switch setup items, zoom photos, inspect material details, and play recorded manufacturer films where they exist. Videos load only after Play and stop when the media, product, or dialog changes. Inspection also works in fullscreen, Inside, and the 2D fallback. Escape, the close button, and the backdrop close the dialog.

**+ / −** zooms. The expand button makes the preview fullscreen. The product catalog works inside native fullscreen and inside the viewport expansion. Closing the catalog keeps the room expanded and returns focus to the catalog button. Browsers without element fullscreen get the viewport expansion. Its exit button or Escape restores the editor.

**Sit in chair**, in the preview or from the Chair chip, enters first person over the selected cushion at a 170 cm person's estimated seated eye level: 123 cm on Aeron, 120 cm on Sayl. Looking around stays available. **Stand up** returns to walking beside the chair.

**Inside** starts standing at an estimated 159 cm eye level. Drag to look. WASD, arrow keys, or the onscreen direction buttons walk. The same **Sit in chair** / **Stand up** toggle is available inside the room. Recenter restores the current posture's viewpoint. Exit view or Escape returns to the overview.

**Room dimensions** takes width and depth from 2.4–10 m and height from 2.2–5 m. Apply updates the room, camera framing, and walking limits without resizing products. Dimensions persist, support Undo, and appear at checkout.

**Position by measurement** sets edge distances in cm. **Blueprint** opens Room, Desk, and Back wall drawings with matching product numbers. **Download PDF** saves a vector placement guide. The completed checkout also links to the blueprint. See [blueprint conventions](docs/blueprint.md).

**Torq Mod Fun Surfboard**, under Extras, mounts on the back wall. Drag it horizontally or vertically, or use the movement buttons. Moving the desk leaves wall items where they are.

Desk input accessories start in fixed places. The keyboard and mouse rest on the desk mat, and the mouse pad adds its own surface height. Each kind can be added once. Extras survive device hydration and undo.

Choose 1, 2, 4, or 8 weeks, then **Rent this setup** opens `/checkout`. Review the itemized setup, fill in contact and delivery details, and save the rental request as JSON. **Back to studio** keeps the setup, positions, and duration.

Prices are illustrative USD weekly rates. The catalog is Jarvis Bamboo and Laminate desks, Herman Miller Aeron and Sayl chairs, Dell UltraSharp 27 and 34 monitors, BenQ WiT, IKEA FEJKA Rosemary, Twelve South Curve, Torq Mod Fun, Logitech Studio Desk Mat and Mouse Pad, MX Keys Mini, MX Master 3S, and Elgato Stream Deck MK.2. Models represent their silhouettes and published envelopes. Official images show the materials. FEJKA foliage spread is estimated. Bamboo is available on the bamboo desk. White and black laminate are available on the laminate desk. Supplier photos or films that show another finish, size, or a styling prop are labeled. These samples do not imply Monis stock or manufacturer affiliation.

No payment, reservation, or booking request is sent. Contact and delivery fields stay in memory, and in the request file only after an explicit download. A finished download clears customer details from the tab. Only the product configuration and a versioned onboarding completion marker are saved on the device automatically. Delivery dates are checked against Bali's UTC+8 calendar.

## Run locally

Use Node.js 24+ and pnpm 11. No account, backend, or environment variables are required.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
pnpm start
```

`pnpm test:e2e` builds the app and serves it on port 3100, so it never reuses a running `pnpm dev`.

Store tests cover independent studio instances, v1/v2/v3 hydration, unavailable storage, draft isolation, and coordinated seating. Domain tests cover catalog and media metadata, old product and finish migration, viewer heights and posture, placement bounds, undo, walking collisions, fit and reflow, quantities, quotes, corrupted saves, and date boundaries. Asset checks cover floor contact, chair seat height, geometry, compression, and budgets. Browser tests cover mouse and touch hold-and-slide, moves, precise placement, layout persistence, standing and seated navigation, zoom, fullscreen and its fallback, the rental flow, desk finishes, desktop and mobile layouts, 3D readiness, the help dialog, and a device without WebGL. Inspection checks cover photo zoom and reset, finish and chair replacement, lazy video playback and cleanup, image retry, removing the selected item, and desktop and mobile layouts. Failures keep traces. The suite also captures the editor, first-person views, fullscreen, and confirmation.

## Sustainable asset workflow

Catalog models are original and parametric, with product-specific silhouettes and runtime desk finishes. Blender renders development thumbnails. Customer-facing catalog and review images are curated official product media, optimized locally. Recorded films use official supplier URLs and do not preload when the dialog opens. A manifest records bounds, versions, provenance, and budgets. The Meshy pilot was skipped because no credentials were configured, and no credits were spent. Any AI generation happens offline, then goes through optimization, dimension calibration, and human approval.

See [asset workflow and pilot](docs/assets.md) for reproducible commands and the production pipeline.

See [viewer calibration](docs/viewer.md) for human proportions, seated positioning, and floor and rug geometry. Eye heights are representative preview measurements. Exact product fit needs validated client dimensions.

See [catalog scale and live sources](docs/catalog-scale.md) and [product media and inspiration](docs/product-media.md). All fifteen products have official sources and posture notes. FEJKA foliage spread remains estimated. The catalog and inspector show W × D × H and evidence status. Select an item in the preview to inspect its source and adjustment notes. Every compressed model is checked against catalog dimensions within 2 mm, with separate seat, tabletop, and screen checks.

## With more time

Connect inventory, date availability, delivery pricing, and server-side quotes before taking bookings. Validate dimensions and asset fidelity with the client, map the samples to real rental stock and media rights, and test on low-end phones. Then add asynchronous asset jobs, human review with version rollback, and a real commerce integration. Placement could add rotation, furniture-to-furniture collision, non-rectangular rooms, and door and window editing. Room scanning remains a separate product bet.

## Submission

Public GitHub repository. `desent-bot` was invited with **Read** access on 10 October 2026. Acceptance is controlled by the bot.
