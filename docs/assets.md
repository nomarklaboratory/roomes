# A catalog that can grow

The browser consumes a small typed catalog and approved GLB files. It does not call an AI provider, generate meshes, or download expiring provider URLs. Product families share geometry conventions; wood finishes are runtime material variants. A larger catalog can replace this adapter without rewriting placement, pricing, or checkout.

## Current assets

All fifteen assets are original parametric interpretations of the real catalog products. Jarvis uses thin tops and black telescopic legs; Aeron has a framed mesh back and seat; Sayl has a frameless lattice and Y support; Dell's 34-inch display uses curved geometry; WiT has articulated arms and a curved light bar; FEJKA has rosemary branches; Curve has an open base and support rails. They are stylized geometry, with photos and recorded films providing material detail. See [physical scale and primary sources](catalog-scale.md).

Sources and measurement evidence live in `lib/catalog.ts` and `lib/desk-accessories.ts`. Desk mats, mouse pads, keyboard, mouse and shortcut controller use builders in `scripts/desk-accessory-models.mjs`; every new compressed asset is below 16 KB. Product media is curated in `docs/product-media-sources.json`, optimized into `public/product-media`, and typed in `lib/product-media-data.ts`. Catalog and review cards use official product images. Blender thumbnails remain useful for reviewing the original meshes. See [media workflow](product-media.md).

The manifest records asset method, family, version, dimensions and source evidence, bounds, triangle count, bytes, units, origin, and approval state. Models use metres, Y-up, and bottom-center origins. The optimizer preserves semantic material names for finish changes. It preserves hierarchy and transforms to prevent normalization from changing reused primitives.

## Rebuild

```sh
pnpm assets:media # refresh the curated official images
pnpm assets:build
# Render uncompressed GLBs; Blender's importer may not support Meshopt.
pnpm assets:thumbnails
pnpm assets:optimize
```

The thumbnail command currently uses the local macOS Blender path. On another machine run `blender --background --python scripts/render-thumbnails.py`. Blender is needed only to regenerate images, not to run or deploy the app. Repeat the entire sequence when changing a family. Inspect bounds and the actual room after optimization, not only the thumbnails. Meshes are built from reusable rounded boxes, cylinders, tubes, and curved panels; finish variations do not need fresh AI jobs.

Rebuild a single SKU without touching the rest of the catalog:

```sh
node scripts/build-assets.mjs torq-mod-fun
ROOMES_ASSET_ID=torq-mod-fun pnpm assets:thumbnails
node scripts/optimize-assets.mjs torq-mod-fun
node scripts/import-product-media.mjs torq-mod-fun
pnpm test
```

Surfboard geometry is exported horizontally with the same bottom-center convention. Its wall anchor and illustrative brackets are applied by the viewer rather than changing the measured product envelope.

## Meshy pilot

Outcome: **skipped because credentials were absent; zero credits spent**. The procedural fallback is the approved submission asset set. We do not claim that AI conversion has been validated for this client's catalog.

The optional `scripts/meshy-pilot.mjs` uses the current Meshy T2 single-image API with smart topology, 4,000 target polygons, and texturing. It is an offline experiment, never a frontend request or deployment step. The agreed experiment is at most two textured requests using 30 existing prepaid credits, within 45 minutes. No purchases. Operator must check prepaid balance and the provider's current price before running.

```sh
# Configure these locally; never commit them.
# MESHY_API_KEY and MESHY_IMAGE_URL (a licensed public HTTPS image)
pnpm assets:ai          # dry-run / fallback when no key
pnpm assets:ai --submit # explicitly starts or resumes the bounded experiment
```

A local, gitignored ledger reserves 15 credits before each paid POST. Paid creation is not automatically retried. A returned task ID is persisted for polling and resumption. An ambiguous POST failure consumes the local reservation until an operator checks the provider dashboard; the script does not assume a refund or submit a duplicate. Successful files are downloaded to a gitignored candidate folder for manual review, not copied into `public/`.

Review silhouette against multiple product photos, hidden/back surfaces, model proportions, disconnected parts, normals, texture artifacts, licensing, and actual mobile load. Calibrate physical dimensions manually, optimize, inspect bounds again, and approve a version before publication. A single photo cannot verify the hidden structure of a product or precise measurements.

Official references: [Meshy image-to-3D](https://docs.meshy.ai/en/api/image-to-3d), [Meshy pricing](https://docs.meshy.ai/en/api/pricing), [glTF Transform](https://gltf-transform.dev/).

## Production follow-on

Use PostgreSQL for products, asset versions, review results, and job records; object storage such as R2 for inputs and published GLBs; BullMQ/Redis and a separate worker for long-running provider work. Deploy the Next.js storefront to Vercel independently. Generation and optimization do not belong in a request-bound serverless handler.

Intake → deduplicate by input hash → choose a parametric family or provider adapter → reserve budget → generate/poll → download → optimize → dimension calibration → human review → publish a version → retain the last approved version for rollback. Do not repeat AI generation for colors/material variants. Changes to price, inventory, and copy do not require mesh regeneration.

Measure cost and operator minutes per approved SKU, fidelity acceptance rate, failure/retry rate, compressed transfer size, and low-end mobile performance before committing to a provider. Start with a representative sample of desks, mesh chairs, reflective monitors, lamps, and plants. Keep an original parametric fallback per family. Backend jobs, automatic batch intake, and commerce integration are future work, not simulated infrastructure in this MVP.
