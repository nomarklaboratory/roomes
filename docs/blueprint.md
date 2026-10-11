# Setup blueprint

Open **Blueprint** from the preview toolbar or **Download your blueprint** after saving the checkout request. The current, confirmed setup is shared across routes and restored from the existing device save. No new layout library or persistence format is introduced.

The Room plan shows desk and chair footprints; arrows mark their front. The Desk plan uses tabletop-local coordinates, so its accessory measurements remain unchanged when the desk moves. Back wall appears only when wall-mounted products are present. Product numbers match the placement list and PDF pages, including independent copies of the same product.

All labels use centimetres rounded to 1 mm. Left/back measurements refer to the nearest product edge, not its centre. Wall height refers to the bottom edge above the floor. Accessory support height includes mats underneath. Dimensions come from the same product envelopes used by the renderer; estimated footprints are marked. Room shell decorations are illustrative and are not measured products.

**Position by measurement** converts edge distances back to the renderer's room, desk or wall coordinate frame. Validation shares placement bounds with dragging. Apply commits one workspace action and one Undo entry. Finish or cancel an active movement before editing numeric positions or exporting a blueprint.

The lazily loaded jsPDF exporter takes a value snapshot at click time and creates vector A4 landscape drawings plus a numbered placement list. PDF content excludes contact information and rental answers. Measure your actual room before using the plan; manufacturer instructions remain the source for product assembly and mounting.

Rental brief, checkout, room dimensions and precise placement use React Hook Form with Zod resolvers. Submit focuses the first invalid field; correcting one field retains other errors. Delivery dates are checked at validation time against Bali's day boundary. Failed downloads retain the setup and entered details for retry.
