# Real products and material inspection

The room model provides scale and placement. Press and hold a product for 420 ms while a circular cursor ring fills. The action wheel offers Duplicate (up), Move (left), Inspect (right), and Delete (down). Duplicate adds the held accessory directly, including in fullscreen, after releasing pointer capture. It finds an unoccupied tabletop or wall position using published product dimensions; a second monitor must fit the desk and both screens reflow together. Copies have independent instance IDs and positions, appear in quote quantities, persist and undo as one change. Duplication is unavailable for desks/chairs, in a read-only preview, or when the surface is full; there is a 20-accessory room limit. Slide right and release to inspect official photographs, manufacturer renders, texture details, lifestyle context, and optional recorded video in a centered dialog. Moving more than 12 pixels before the wheel opens cancels the hold. Pointer cancellation, switching tabs, losing window focus, or pressing Escape also cancels a pending hold. Inspection never commits a furniture move.

The dialog overlays the preview without resizing the room. It also works in review, first person, and fullscreen. The Inspect product button offers keyboard access and works in the 2D fallback. Close it with Escape, the close button, or the backdrop; focus returns to Inspect product.

## Product detail layout

The ecommerce layout places a zoomable gallery beside the product name, weekly rental price, model, and preview dimensions. On phones the gallery is followed by product information, with source notes afterward. The room-product selector and Overview, Specifications, and Reviews navigation stay visible while scrolling. Longer photo and scale notes live in an expandable section. All interface text is at least 16 px, styled with Tailwind utilities.

Photos show a magnifier and View details hint across a clickable image. Zooming requests an image sized for the larger view; customers can drag with the mouse, swipe on touch, or scroll through the magnified details. A persistent exploration hint and Reset zoom control remain visible. Changing the photo or product resets zoom and pan position.

Ratings and comments are fictional fixtures stored separately from catalog evidence in `lib/demo-product-reviews.ts`. The product modal displays them without demo badges or sample-reviewer labels. Each product category has three sample comments, with a 4.7 average and working All, 5-star, and 4-star filters. Switching products resets the filter and scroll position. The fixtures have no verified-buyer badges and do not change the saved workspace.

## Curated sources

`docs/product-media-sources.json` records the original URL, caption, variant, presentation type, finish, and optional video poster for each item. Jarvis, Aeron and Sayl media comes from Herman Miller's official stores and product pages; monitor media from Dell; WiT from BenQ; FEJKA from IKEA; Curve from Twelve South. Each image or film has an original-media link in the inspector and each product links to its official listing.

Images are cropped or rendered exactly as supplied; the importer does not infer textures or invent photography. Isolated catalog imagery is labeled “Manufacturer image” when photography versus rendering is uncertain. Dell renders are labeled explicitly. General material/lifestyle examples and films may show another finish, size, or props; their variant text identifies that context. Finish-specific Jarvis hero images follow the selected finish. The current laminate selector offers white and black; older walnut saves migrate to white.

## Rebuild

```sh
pnpm assets:media
```

The importer fetches only the curated source list, preserves aspect ratio, caps image dimensions at 1400 pixels without enlarging small originals, and writes WebP files under `public/product-media`. It generates the typed `lib/product-media-data.ts` adapter. Customer image requests use these local files through Next Image; they do not depend on a supplier image server at runtime. Existing small supplier swatches retain their original resolution.

Video is optional. Official Aeron and Sayl films are mounted only after an explicit Play action. Native controls handle playback and seeking; the hook pauses the player on media/product changes or closing. No video is requested when a thumbnail or the dialog first opens. A loading failure offers retry and the original source link. Film access still depends on the supplier URL.

Inspection selection and zoom are temporary viewer state. Replacing a product, changing a finish or removing an inspected item resolves against the current setup and resets the media context. Rental state and pricing are unchanged by inspection. Shared media/catalog/configuration types live under `types/`; hooks own inspection state, focus, zoom and playback effects.

## Inspiration and applied choices

[IKEA Kreativ](https://www.ikea.com/gb/en/customer-service/knowledge/articles/1bcac7e8-a645-4dd0-bf9f-54769b0403d0.html) informed keeping furniture selection close to the room. [Herman Miller's Aeron configurator](https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/product-configurator/) and [Aeron store details](https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/100777305.html?lang=en_US) informed variant-aware imagery and close material views. [Apple's AR Quick Look shopping demonstration](https://developer.apple.com/videos/play/wwdc2020/10604/) informed preserving shopping context while a customer explores a product. These are design references; this implementation uses a 3D room and sourced media, with room scanning and AR left for later work.

[Shopee's product-detail guide](https://ads.shopee.sg/learn/faq/520/172) and [Shopify's product-page examples](https://www.shopify.com/blog/product-page) informed the gallery, visible price and rating, concise specifications, and separate review section.

## Verification

Domain checks cover curated asset existence, metadata, finish constraints, canonical IDs, and legacy migration. Desktop/mobile browser checks exercise image zoom/reset, finish and chair replacement, lazy playback and cleanup, unavailable-photo retry, removal recovery, fullscreen/Inside focus and Escape behavior, review inspection, and the WebGL fallback. A tiny generated WebM fixture keeps playback tests independent of supplier connectivity.

## Desktop accessories

The expanded extras catalog follows the official [Logitech Studio Desk Mat](https://www.logitech.com/en-us/shop/p/desk-mat-studio-series), [Studio Mouse Pad](https://www.logitech.com/en-us/shop/p/mouse-pad-studio-series), [MX Keys Mini](https://www.logitech.com/en-us/shop/p/mx-keys-mini), and [MX Master 3S](https://www.logitech.com/en-us/shop/p/mx-master-3s) catalogs. Top/profile and curled material-detail photos use the selected Mid Grey, Dark Rose, and Graphite variants. Images are imported as local WebP files.

[Elgato's MK.2 specifications](https://help.elgato.com/hc/en-us/articles/18208816152333-Elgato-Stream-Deck-MK-2-Technical-Specifications) supply the controller dimensions without its removable stand. The original preview lies flat; the supplier hero includes the stand and is labeled accordingly. The second photo comes from the official faceplate guide. MK.2 is distinct from the newer Stream Deck Scissor Keys model.
