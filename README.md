# Workspace Studio for monis.rent

An interactive Bali workspace designer: arrange real products in 3D, step inside the room, inspect official product photos and recorded films, and review a rental request on a dedicated checkout page.

**Published MVP:** https://roomes-lac.vercel.app

**Source:** https://github.com/nomarklaboratory/roomes

## Approach

Customers arriving in Bali automatically start with a one-page rental brief: area, preferred date, duration, work style and screen space, with optional budget and room measurements. A deterministic recommendation checks monitor dimensions and finds a complete desk/chair setup within the equipment budget when possible. If it cannot, it shows the cheapest valid option and shortfall without dropping requested monitors. Applying a suggestion is one undoable change. The scoped rental-brief store carries answers into checkout without writing them to browser storage; only a separate pending/completed marker persists. The brief opens until explicitly completed or skipped, including for older saved rooms. Saved setups remain intact, and the renderer mounts after entering Design.

The hard part is helping someone picture a complete setup quickly. The rental brief gives them a useful starting point, and a large cutaway room makes each selection tangible. The designer goes straight to their suggested room without another preset chooser. Drag furniture across the room and accessories across the tabletop, or use precise movement buttons. The desk carries its accessories, positions stay within their surfaces, and each completed drag creates one undo step. Quick placement slots and deterministic reflow still handle smaller desks and incompatible monitor combinations.

Next.js App Router and Tailwind CSS provide the interface; React Three Fiber, Drei, and Three.js render original, reusable GLB models. Tailwind utilities style the components; `app/tailwind.css` contains only the Tailwind entry and theme. Shared domain types live in `types/`, `cn` combines class names, and ts-belt groups the catalog. Three scoped Zustand stores are shared across studio and checkout routes. The session-only rental-brief store holds committed answers; the workspace store owns committed configuration and undo, while the editor store owns selection, camera/posture controls, and unfinished placement. Objects subscribe only to their own movement draft. Hooks keep camera input, pointer capture, fullscreen, and inspection effects local; checkout owns its form state. The catalog and configuration rules are independent of the renderer. The existing pure reducer handles history and configuration rules; quotes are derived in integer cents. Device storage keeps the existing versioned setup envelope, including product IDs, finishes, and layouts migrated from earlier saves. Draft movement and editor controls never write to storage; confirming placement creates one undo entry. The renderer loads on the client, renders on demand outside first-person mode, bounds its pixel density, and falls back to an updating 2D illustration if WebGL is unavailable. First-person navigation uses a separate eye-level camera with room and furniture collision bounds; it supports drag-to-look, keyboard walking, and touch controls without requiring pointer lock.

## Try it

- On a first visit, fill the **rental brief** for an editable suggestion, or **Skip rental brief** to start designing. Monitor users can record a laptop connection preference; compatibility and cables still need verification. **Edit rental brief** reopens it; **Back to my setup** leaves the room untouched.

- Choose from two desks and two chairs, and change the tabletop finish.
- Add monitors, a lamp, a plant, or a laptop stand. Up to two monitors must fit the desk. Accessories can be duplicated when another copy fits on their tabletop or wall surface; desks and chairs remain one per setup.
- Hold a setup item until the action wheel appears. Slide up to **Duplicate** to add another copy of that accessory directly, left to **Move**, right to **Inspect**, or down to **Delete** an accessory, then release. Copies get independent positions, count toward the rental quote, save on the device, and undo in one step. Duplicate is disabled for furniture and when another copy cannot fit. Move the pointer or drag on touch, then click or tap **Place**; **Cancel** or Escape discards the draft. Use Top for easier placement, or select a chip below the preview for movement buttons and position reset. Furniture and wall items move in 10 cm steps; tabletop accessories in 2 cm steps. Undo and device saving include positions.
- Use the **+ / −** controls to zoom and the expand button to make the preview fullscreen. The product catalog works inside both native fullscreen and viewport expansion; closing it keeps the room expanded and restores focus to the catalog button. A viewport expansion works in browsers without element fullscreen; its exit button or Escape restores the editor.
- Click **Sit in chair** directly in the preview, or select the Chair chip and choose **Sit in this chair**. Both enter first person over the selected chair cushion at a 170 cm person's estimated seated eye level: 123 cm on Aeron, 120 cm on Sayl. Looking around stays enabled; **Stand up** returns to walking beside the chair.
- Open **Room dimensions** to enter width and depth (2.4–10 m) and height (2.2–5 m). Apply updates the room, camera framing, and walking limits without resizing products. Dimensions persist, support Undo, and appear in review.
- Select a product and use **Position by measurement** to enter edge distances in cm. Open **Blueprint** for Room, Desk and Back wall drawings with matching product numbers and **Download PDF** for a vector placement guide. Checkout completion also links to the blueprint. See [blueprint conventions](docs/blueprint.md).
- Add **Torq Mod Fun Surfboard** under Extras to mount it on the back wall. Drag horizontally or vertically, or use the movement buttons. Desk movement leaves wall items in place.
- Choose **Inside** to start standing at an estimated 159 cm eye level. Drag to look; use WASD, arrow keys, or hold the onscreen direction buttons to walk. The same Sit in chair / Stand up toggle is available inside the room. Recenter restores the current posture's viewpoint; Exit view or Escape returns to the overview.
- Hold a 3D product until its action wheel appears, slide right to **Inspect**, and release to open the official media in a centered dialog. Moving before the hold completes cancels the action; sliding down to **Delete** asks for confirmation on accessories. **Inspect product** provides keyboard access and shows the selected item, or the desk by default. Switch between setup items, zoom photos, inspect material details, and play recorded manufacturer films where available. Videos load only after Play and stop when the media, product, or dialog changes. Inspection also works in review, fullscreen, Inside, and the 2D fallback. Escape, the close button, and the backdrop dismiss the dialog.
- Choose 1, 2, 4, or 8 weeks, then click **Rent this setup** to open `/checkout`. Review your itemized setup, fill in contact and delivery details, and save the rental request as a JSON file. **Back to studio** preserves the setup, positions, and duration.

Desk input accessories have dedicated default positions. Keyboard and mouse rest on the desk mat; the mouse pad adds its own surface height. Each kind can be added once, and all extras survive device hydration and undo.

All prices are **illustrative USD weekly rates**. The catalog contains Jarvis Bamboo and Laminate desks, Herman Miller Aeron and Sayl chairs, Dell UltraSharp 27 and 34 monitors, BenQ WiT, IKEA FEJKA Rosemary, Twelve South Curve, Torq Mod Fun, Logitech Studio Desk Mat and Mouse Pad, MX Keys Mini, MX Master 3S, and Elgato Stream Deck MK.2. Models represent their silhouettes and published envelopes; official images show the actual materials. FEJKA foliage spread is estimated. Bamboo is available on the bamboo desk; white and black laminate on the laminate desk. Supplier photos or films that show another finish, size, or a styling prop are labeled. These sample products do not imply Monis stock or manufacturer affiliation. No payment, reservation, or booking request is sent. Contact and delivery fields stay in memory and in the request file only when explicitly downloaded. Download completion clears customer details from this tab. Only the product configuration and a versioned onboarding completion marker are automatically saved on the device. Delivery dates are checked against Bali's UTC+8 calendar.

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

Store tests cover independent studio instances, compatible v1/v2/v3 hydration, unavailable storage, draft isolation, and coordinated seating. Domain tests exercise real catalog/media metadata, old product/finish migration, viewer heights/posture, placement bounds, undo, walking collisions, fit/reflow, quantities, quotes, corrupted persistence, and date boundaries. Asset checks verify floor contact, chair seat height, geometry, compression, and budgets. Browser tests cover real mouse/touch dragging, precise moves, layout persistence, standing/seated navigation, zoom, fullscreen and its browser fallback, the complete rental flow, presets/finishes, desktop/mobile layouts, 3D readiness, the help dialog, and a device without WebGL. Inspection checks cover photo zoom/reset, finish and chair replacement, lazy video playback/cleanup, image retry, selected item removal, review, and desktop/mobile layouts. Tests retain traces on failure and capture the editor, first-person views, fullscreen, and confirmation for visual inspection.

## Sustainable asset workflow

The real-product catalog uses original parametric models with product-specific silhouettes and runtime desk finishes. Blender renders development thumbnails; customer-facing catalog and review images use curated official product media, optimized locally. Recorded films use official supplier URLs and never preload on opening the dialog. A manifest records bounds, versions, provenance, and budgets. The optional, bounded Meshy pilot was skipped because no credentials were configured; no credits were spent. AI generation happens offline, followed by optimization, dimension calibration, and human approval.

See [asset workflow and pilot](docs/assets.md) for reproducible commands and the production pipeline. The agreed epics and scaling roadmap are in [.plan/epics.md](.plan/epics.md).

See [viewer calibration](docs/viewer.md) for human proportions, seated positioning, and floor/rug geometry. The eye-height assumptions are representative preview measurements; exact product fit requires validated client dimensions.

See [catalog scale and live sources](docs/catalog-scale.md) and [product media and inspiration](docs/product-media.md). All fifteen products have official sources and posture notes; FEJKA foliage spread remains estimated. The catalog and inspector show W × D × H and evidence status; select an item in the preview to inspect its source and adjustment notes. Every compressed model is checked against catalog dimensions within 2 mm, with separate seat, tabletop, and screen checks.

## With more time

Connect authoritative inventory, date availability, delivery pricing, and server-side quotes before taking bookings. Validate product dimensions and asset fidelity with the client, map the sample products to actual rental stock and media rights, and test performance on low-end phones. Then introduce asynchronous asset jobs, human review/version rollback, and a real commerce integration. Extend placement with rotation, furniture-to-furniture collision checks, non-rectangular rooms, and door/window editing. Room scanning remains a separate product bet.

## Submission

Next.js · Tailwind CSS · Vercel. Public GitHub repository; `desent-bot` was invited with **Read** access on 10 October 2026. Acceptance is controlled by the bot.
