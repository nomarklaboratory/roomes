# Physical catalog scale

Sources checked **11 October 2026**. One scene unit is one metre. Catalog sizes are **width × depth × height**, including the stand/base in the displayed posture. Models remain original stylized illustrations; matching the envelope does not make them exact replicas or a guarantee about delivered stock.

## Published measurements

- Electric desk: **120 × 60 cm**, Small variant; **75 cm** preview height within the listed **70–118 cm** range. Stock may be WS414, GD914, or similar. [Monis listing](https://www.monis.rent/products/electrical-adjustable-desk).
- Wooden desk: **160 × 80 cm**, matching the selector and technical field; **75 cm** preview height within **70–120 cm**. The summary instead says 160 × 70 cm. Confirm the selected variant before ordering. [Monis listing](https://www.monis.rent/products/adjustable-wooden-desk).
- Ergonomic chair: rental SKU **Fantech OCA259PRO**. Manufacturer diagram: **61–65 cm** arm width, **66 cm** base depth, **115–128 cm** overall height, **50 × 48 cm** seat, **49–57 cm** seat height. Preview uses arms at 65 cm, overall height 115 cm, seat 49 cm, leg rest retracted. A 170 cm viewer's seated eyes are at **127 cm**. [Rental SKU](https://www.monis.rent/products/ergonomic-office-chair), [manufacturer diagram](https://fantech.ph/wp-content/uploads/2024/10/oca259-pro-black-7.jpg).
- 27″ monitor: **612.9 × 200 × 514.9 mm** including stand, for the Redmi A27U / Xiaomi A27Ui listing. The screen uses a **27″ diagonal and 16:9 aspect**, independent of stand height. The earlier 43 cm catalog height was too short. [Monis listing](https://www.monis.rent/products/27-4-k-multimedia-monitor).
- 34″ monitor: **810.39 × 242.53 × 520.61 mm**, including stand. The rental listing swaps depth/height labels; the manufacturer manual resolves them. This is the **144 Hz Mi Curved** variant, not the separate 180 Hz model. Active-screen diagonal is 34″, aspect follows 3440:1440; the stylized panel remains flat. [Rental listing](https://www.monis.rent/products/4-k-ultra-wide-34), [manufacturer manual](https://i01.appmifile.com/webfile/globalimg/Global_UG/Mi_Ecosystem/Mi_Curved_Gaming_Monitor_34/Mi_CurvedMonitor_34_All_V1.pdf).
- Lamp: **Mi LED Desk Lamp 1S**, opened. Manufacturer support gives **440 × 150 × 420 mm**, a 150 mm base, and 426 mm arm. The arm faces forward: room axes are **150 mm width × 440 mm depth × 420 mm height**. The rental listing's 162 × 162 × 479 mm is not used for this opened posture. [Rental SKU](https://www.monis.rent/products/smart-led-desk-lamp-1-s), [manufacturer opened dimensions](https://www.mi.com/sg/support/faq/details/KA-07549/).

## Measurements still needed

The [KOLMI laptop stand listing](https://www.monis.rent/products/ergonomic-laptop-stand) publishes no numeric dimensions. Its **28 × 24 × 15 cm** preview is explicitly estimated. Measure the actual stock in its deployed posture before approval. The Everyday chair and plant are original concepts with no matching rental SKU; their dimensions are labeled concepts. Replace them with measured stock for a production inventory adapter.

Follow-up web search on the same date: the [manufacturer's laptop-stand collection](https://kolmi.id/collection/laptop-stand/) currently returns no products. Its [linked official marketplace](https://shopee.co.id/kolmiindonesia) exposes a laptop-stand category, but no verifiable dimension sheet for the rental model was found. Other sellers' similar stands do not establish the exact Monis version. The [full Monis catalog](https://www.monis.rent/products) displays one chair product, the OCA259PRO; no matching second chair or plant rental was found. The demo keeps its required second chair as an explicitly labeled concept rather than inventing a stock SKU or treating a similar product's dimensions as confirmed.

## Preventing scale drift

`lib/catalog.ts` is the dimension source for the builder, placement, and seated camera. Each product carries evidence status, model/variant, source, check date, and posture notes. Desks and monitors are parameterized from those values. Other shapes are calibrated to their catalog envelopes; chair vertical geometry preserves the seat anchor. Every GLB rests at Y=0 and is centered on its X/Z footprint. Accessories rest at the selected desk height; default slots account for accessory depth.

Compressed-asset checks compare all three geometry axes to the catalog within **2 mm**, then verify origins, tabletop/seat anchors, ergonomic seat size, screen diagonal/aspect, versions, source evidence, and the 75 KB budget. This validates geometry against the catalog; it cannot verify unpublished measurements. Model and thumbnail version 3 invalidates earlier cached scales.

For a larger catalog, collect assembled dimensions and adjustment posture per SKU/variant at intake. Keep package dimensions separate. Require evidence or physical measurement before approval, retain the previous approved version, and run the same compressed-asset checks for procedural and AI candidates. An AI mesh must never automatically promote an estimated measurement to a verified one.
