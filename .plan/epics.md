# Roomes — monis.rent workspace studio

## Agreed scope

Challenge MVP: a desktop-first, mobile-usable 3D rental configurator inspired by IKEA Kreativ. Customers start from Essentials, Developer, or Creative, choose at least two desks and two chairs, add accessories, arrange the setup, and review a simulated rental request. The follow-up scope adds direct movement and first-person viewing (E09). Next.js, Tailwind, Vercel, public GitHub repository, and a Read invitation for desent-bot are required.

All prices are illustrative USD weekly rates; terms are 1, 2, 4, or 8 weeks. Default: Developer / 4 weeks. Product geometry is stylized. One chair and the plant are labeled concepts. No payment, live stock, real reservation, or personal-data persistence.

## E01 — Foundation and catalog

- Typed catalog with stable product IDs, source links, dimensions, demo rates, and asset references.
- Pure configuration rules, integer-cent quotes, versioned local persistence, history, and reset.
- Acceptance: product metadata stays independent of UI and mesh implementation.

## E02 — Reusable 3D assets and AI pilot

- Original low-poly GLB assets, shared geometry and finish variants; reproducible asset and thumbnail builds.
- Optional Meshy pilot: existing credits only, maximum 30 credits / 2 textured requests / 45 minutes; no purchases. Missing credentials selects the procedural fallback.
- Acceptance: every required SKU has a preview, provenance, dimensions, and a reproducible route to replacement. AI output is never automatically published.

## E03 — Preset rooms and live preview

- Three room presets, product swaps, accessible camera controls, scene selection, and fallback preview.
- Lazy client-only renderer with an error boundary, demand rendering, and bounded resolution.
- Acceptance: every selection visibly updates the room on desktop and mobile.

## E04 — Configuration, placement, and pricing

- Desk/chair selection; up to two monitors and one lamp, plant, and laptop stand.
- Valid placement slots, deterministic reflow on desk changes, finish selection, undo, reset, and rental duration.
- Acceptance: no overlapping slots or incompatible monitor combinations; totals update immediately.

## E05 — Review and simulated checkout

- Selected line items, quantities, duration, weekly rate, and total; edit returns to the same configuration.
- Name, Bali area, and a future delivery date validated using Bali's calendar.
- Acceptance: confirmation is explicitly a demo and personal fields never enter storage or a network request.

## E06 — Verification and submission

- Domain tests, browser interaction/mobile/fallback tests, production build, and visual inspection.
- README: approach, tech choices, limitations, follow-up ideas, live URL, and source repository.
- Public nomarklaboratory/roomes repository, desent-bot Read invitation, and public Vercel production URL.

## E07 — Production asset operations (future)

PostgreSQL catalog and asset versions; R2 object storage; BullMQ/Redis jobs on a separate worker. Batch intake → image validation → provider adapter → optimization → dimension calibration → human review → publication. Retry idempotently, meter credits per SKU, deduplicate by input hash, retain the last approved version, and support rollback. Reuse parametric families before generating new assets. Track approval cost, fidelity, failure rate, time per SKU, and mobile asset budgets.

## E08 — Real rental commerce (future)

Connect authoritative catalog, prices, stock by date, service areas, delivery constraints, and reservation APIs. Server-authoritative quotes and inventory holds precede payments. Add operational admin tooling, privacy/retention policies, analytics with consent, and production accessibility/performance monitoring.

## Boundaries

Room scans, accurate fit guarantees, live commerce, and a production asset backend are outside this submission. Epics E07–E08 are a scaling roadmap, not unfinished MVP requirements. Rotation and collision-aware furniture arrangement remain future extensions; current placement clamps items to room/tabletop bounds.

## E09 — Movable items and first-person viewing

- Direct mouse/touch dragging for desk, chair, and all selected accessories; accessories stay in desk-local coordinates and follow desk movement.
- Dimension-based floor/tabletop bounds, precise accessible movement buttons, quick desk slots, per-item position reset, and one undo entry per completed drag.
- Persist layout and custom positions; migrate earlier saved configurations and sanitize malformed coordinates.
- Inside camera at eye level: drag to look, WASD/arrows or onscreen buttons to walk, room/furniture navigation collision checks, recenter, and Escape/visible exit.
- Keep review read-only; retain pricing, product constraints, device saving, and a placement-aware 2D fallback.
- Acceptance: real mouse/touch dragging, undo, reload persistence, and first-person navigation work on desktop/mobile, with no overflow or browser errors.

## E10 — Human scale and preview controls

- Calibrate a 170 cm viewer using representative eye levels: 159 cm standing and 124 cm seated on a 46 cm seat.
- Sit in the selected chair, follow its placement, pause walking while seated, and stand up into clear floor space. Retain drag-to-look, recenter, and exit.
- Ground chair casters and desk feet, keep the rug 8 mm thick, and clamp bevel radii to avoid inflated thin surfaces. Validate floor contact and seat height in compressed assets.
- Provide visible zoom controls for overview and first-person cameras; fullscreen uses the browser API with viewport expansion as a fallback and a visible exit.
- Version revised models/thumbnails to avoid stale caches; preserve rental state, prices, and item placement.
- Acceptance: desktop/mobile zoom, fullscreen, fallback exit, seated navigation, and rental regression checks pass; visual inspection confirms a flat rug and visible chair wheels.

## Execution record

- E01–E05 implemented: catalog, assets, presets, configuration, and simulated checkout.
- Meshy credentials absent: procedural GLB fallback selected; zero AI credits spent.
- Initial MVP: five domain tests, nine asset validations, six desktop/mobile browser tests, typecheck, lint, and production build passed.
- Public Vercel production alias: https://roomes-lac.vercel.app.
- Public source: https://github.com/nomarklaboratory/roomes.
- desent-bot Read invitation sent (pending acceptance).
- E06 complete: source published, Read invitation verified, production alias returns HTTP 200 without authentication, and anonymous desktop/mobile rental flows verified.
- E07–E08 remain the explicitly deferred production roadmap.
- Vercel onboarding guide followed: global CLI 63.1.2 authenticated, Vercel guidance installed/enabled, shared MCP endpoint configured, and MCP OAuth succeeded. Newly installed MCP tools require a client reload before their read-only documentation/team checks can run.
- E09 implemented: surface-bounded dragging, precise movement/reset, placement-aware fallback, saved layout migration, and first-person walking/look/recenter/exit.
- Eight domain tests, nine asset validations, and eight desktop/mobile browser tests pass, including actual touch/mouse dragging, cancellation recovery, atomic undo, persistence, and first-person navigation. Typecheck, lint, formatting, and the production build also pass.
- E10 implemented: 170 cm standing/seated profile, seat-aware camera placement, flat rug and grounded furniture, model/thumbnail versions, zoom, and native/fallback fullscreen.
- Ten domain tests and nine asset validations pass. Desktop/mobile browser checks cover all twelve scenarios, including seated walking suppression, zoom, fullscreen, Escape restoration, and rental regressions. Typecheck, lint, and formatting pass; visual inspection confirms the rug no longer hides the chair base.
