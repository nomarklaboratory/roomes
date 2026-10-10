# Roomes — monis.rent workspace studio

## Agreed scope

Challenge MVP: a desktop-first, mobile-usable 3D rental configurator inspired by IKEA Kreativ. Customers start from Essentials, Developer, or Creative, choose at least two desks and two chairs, add accessories in valid slots, and review a simulated rental request. Next.js, Tailwind, Vercel, public GitHub repository, and a Read invitation for desent-bot are required.

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

Free dragging, room scans, accurate fit guarantees, live commerce, and a production asset backend are outside this submission. Epics E07–E08 are a scaling roadmap, not unfinished MVP requirements.

## Execution record

- E01–E05 implemented: catalog, assets, presets, configuration, and simulated checkout.
- Meshy credentials absent: procedural GLB fallback selected; zero AI credits spent.
- Five domain tests, nine asset validations, six desktop/mobile browser tests, typecheck, lint, and production build pass.
- Public Vercel production alias: https://roomes-lac.vercel.app.
- Public source: https://github.com/nomarklaboratory/roomes.
- desent-bot Read invitation sent (pending acceptance).
- E06 final artifact verification and publishing in progress. E07–E08 remain the explicitly deferred production roadmap.
