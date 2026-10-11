// Curated official sources: docs/product-media-sources.json. Rebuild with pnpm assets:media.
import type { ProductMedia } from "../types/catalog.ts";

export const mediaByProduct: Record<string, readonly ProductMedia[]> = {
  "jarvis-bamboo": [
    {
      id: "0",
      caption: "Natural bamboo tabletop · black frame",
      variant: "120 × 80 cm · bamboo / black",
      source:
        "https://cdn.shopify.com/s/files/1/0417/3266/9593/files/12-REC-BLK-SUD-NOG-01_b63ee0b2-8631-4260-8680-c55235d9dbe6.jpg?v=1789567333",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/jarvis-bamboo/0.webp",
      alt: "Natural bamboo tabletop · black frame. 120 × 80 cm · bamboo / black.",
      finish: "bamboo",
    },
    {
      id: "1",
      caption: "Bamboo surface and edge detail",
      variant: "Natural bamboo",
      source:
        "https://ukstore.hermanmiller.com/cdn/shop/files/Fully_Jarvis-Design_Details-Bamboo_341x455_crop_center.jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/jarvis-bamboo/1.webp",
      alt: "Bamboo surface and edge detail. Natural bamboo.",
      finish: "bamboo",
    },
    {
      id: "2",
      caption: "Jarvis in a real workspace",
      variant: "Bamboo · supplier styling example",
      source:
        "https://ukstore.hermanmiller.com/cdn/shop/files/Fully-Jarvis-Bamboo-PDP01.jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/jarvis-bamboo/2.webp",
      alt: "Jarvis in a real workspace. Bamboo · supplier styling example.",
      finish: "bamboo",
    },
  ],
  "jarvis-laminate": [
    {
      id: "0",
      caption: "White laminate tabletop · black frame",
      variant: "160 × 80 cm · white / black",
      source:
        "https://cdn.shopify.com/s/files/1/0417/3266/9593/files/FUL_2548841_100348645_white_black_a_81e1cfe1-fbf9-4979-8a3e-20bdd317d588.jpg?v=1789567417",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/jarvis-laminate/0.webp",
      alt: "White laminate tabletop · black frame. 160 × 80 cm · white / black.",
      finish: "white",
    },
    {
      id: "1",
      caption: "Black laminate tabletop · black frame",
      variant: "160 × 80 cm · black / black",
      source:
        "https://cdn.shopify.com/s/files/1/0417/3266/9593/files/FUL_2548841_100348643_black_black_a_a6c47697-1c5e-489c-9de7-70730e864f8e.jpg?v=1789567417",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/jarvis-laminate/1.webp",
      alt: "Black laminate tabletop · black frame. 160 × 80 cm · black / black.",
      finish: "black",
    },
    {
      id: "2",
      caption: "Laminate surface and edge detail",
      variant: "Supplier detail · finish shown may differ",
      source:
        "https://ukstore.hermanmiller.com/cdn/shop/files/Fully-Jarvis-Laminate-PDP-DD01_341x455_crop_center.jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/jarvis-laminate/2.webp",
      alt: "Laminate surface and edge detail. Supplier detail · finish shown may differ.",
    },
    {
      id: "3",
      caption: "Jarvis in a real workspace",
      variant: "Supplier styling example · finish shown may differ",
      source:
        "https://ukstore.hermanmiller.com/cdn/shop/files/Fully-Jarvis-Laminate-PDP01.jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/jarvis-laminate/3.webp",
      alt: "Jarvis in a real workspace. Supplier styling example · finish shown may differ.",
    },
  ],
  "herman-miller-aeron": [
    {
      id: "0",
      caption: "Graphite Aeron · medium size B",
      variant: "Graphite frame · height-adjustable arms",
      source:
        "https://cdn.shopify.com/s/files/1/0417/3266/9593/files/aFRONT-FPF_HAA_NU_TLO_30455f5b-d9ed-4d58-81bf-5cb913cc6a9c.jpg?v=1789566897",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/herman-miller-aeron/0.webp",
      alt: "Graphite Aeron · medium size B. Graphite frame · height-adjustable arms.",
    },
    {
      id: "1",
      caption: "8Z Pellicle mesh detail",
      variant: "Aeron suspension · supplier detail · frame color shown differs",
      source:
        "https://ukstore.hermanmiller.com/cdn/shop/files/Aeron-DD-Pellicle_341x455_crop_center.jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/herman-miller-aeron/1.webp",
      alt: "8Z Pellicle mesh detail. Aeron suspension · supplier detail · frame color shown differs.",
    },
    {
      id: "2",
      caption: "Aeron in motion · manufacturer film",
      variant: "Aeron family · multiple colors and sizes shown",
      source:
        "https://www.hermanmiller.com/content/dam/hmicom/page_assets/products/aeron_chair/2026_06/fv_prd_ovw_aeron_chair.mp4",
      kind: "video",
      src: "https://www.hermanmiller.com/content/dam/hmicom/page_assets/products/aeron_chair/2026_06/fv_prd_ovw_aeron_chair.mp4",
      poster: "/product-media/herman-miller-aeron/0.webp",
    },
  ],
  "herman-miller-sayl": [
    {
      id: "0",
      caption: "Black suspension back and Kingsmead seat",
      variant: "Black · fixed arms · Kingsmead upholstery",
      source:
        "https://cdn.shopify.com/s/files/1/0417/3266/9593/files/AS1EA33PA_N2_BK_C7_BK_BK_Z1A67_FRONT_88a22093-5af8-48f7-a18e-0ba433a6b7d1.jpg?v=1789567315",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/herman-miller-sayl/0.webp",
      alt: "Black suspension back and Kingsmead seat. Black · fixed arms · Kingsmead upholstery.",
    },
    {
      id: "1",
      caption: "Kingsmead upholstery texture",
      variant: "Black Kingsmead seat fabric",
      source:
        "https://ukstore.hermanmiller.com/cdn/shop/files/sw_sayl-upholstery-black-kingsmead.jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/herman-miller-sayl/1.webp",
      alt: "Kingsmead upholstery texture. Black Kingsmead seat fabric.",
    },
    {
      id: "2",
      caption: "Suspension back and Y-Tower support",
      variant: "Black suspension back · supplier view",
      source:
        "https://www.hermanmiller.com/content/dam/hmicom/page_assets/products/sayl_chairs/ig_prd_ovw_sayl_chairs_09.jpg",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/herman-miller-sayl/2.webp",
      alt: "Suspension back and Y-Tower support. Black suspension back · supplier view.",
    },
    {
      id: "3",
      caption: "Sayl in use · manufacturer film",
      variant: "Sayl family · finish shown may differ",
      source:
        "https://cdn.shopify.com/videos/c/o/v/7f369a1682264d1f8520b14c80fbe235.mp4",
      kind: "video",
      src: "https://cdn.shopify.com/videos/c/o/v/7f369a1682264d1f8520b14c80fbe235.mp4",
      poster: "/product-media/herman-miller-sayl/0.webp",
    },
  ],
  "dell-u2725qe": [
    {
      id: "0",
      caption: "27-inch UltraSharp · front angle",
      variant: "U2725QE · silver / black",
      source:
        "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u2725qe/media-gallery/monitor-ultrasharp-u2725qe-gy-gallery-1.psd?fmt=jpg&wid=1200",
      kind: "image",
      presentation: "render",
      src: "/product-media/dell-u2725qe/0.webp",
      alt: "27-inch UltraSharp · front angle. U2725QE · silver / black.",
    },
    {
      id: "1",
      caption: "Quick-access ports and edge detail",
      variant: "U2725QE · manufacturer detail",
      source:
        "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u2725qe/pdp/monitor-u2725qe-quick-access-ports.psd?fmt=jpg&wid=1200",
      kind: "image",
      presentation: "render",
      src: "/product-media/dell-u2725qe/1.webp",
      alt: "Quick-access ports and edge detail. U2725QE · manufacturer detail.",
    },
  ],
  "dell-u3425we": [
    {
      id: "0",
      caption: "34-inch curved UltraSharp · front angle",
      variant: "U3425WE · silver / black",
      source:
        "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u3425we/media-gallery/monitor-ultrasharp-u3425we-gray-gallery-1.psd?fmt=jpg&wid=1200",
      kind: "image",
      presentation: "render",
      src: "/product-media/dell-u3425we/0.webp",
      alt: "34-inch curved UltraSharp · front angle. U3425WE · silver / black.",
    },
    {
      id: "1",
      caption: "Underside ports and housing detail",
      variant: "U3425WE · silver / black",
      source:
        "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u3425we/media-gallery/monitor-ultrasharp-u3425we-gray-gallery-4.psd?fmt=jpg&wid=1200",
      kind: "image",
      presentation: "render",
      src: "/product-media/dell-u3425we/1.webp",
      alt: "Underside ports and housing detail. U3425WE · silver / black.",
    },
  ],
  "benq-wit": [
    {
      id: "0",
      caption: "WiT articulated lamp and curved light bar",
      variant: "Supplier styling example · colors shown may differ",
      source: "https://image.benq.com/is/image/benqco/01-91?wid=1200&fmt=jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/benq-wit/0.webp",
      alt: "WiT articulated lamp and curved light bar. Supplier styling example · colors shown may differ.",
    },
    {
      id: "1",
      caption: "Silver WiT in a workspace",
      variant: "WiT · silver",
      source:
        "https://image.benq.com/is/image/benqco/05-silver-1?wid=1200&fmt=jpg",
      kind: "image",
      presentation: "photo",
      src: "/product-media/benq-wit/1.webp",
      alt: "Silver WiT in a workspace. WiT · silver.",
    },
  ],
  "ikea-fejka": [
    {
      id: "0",
      caption: "Artificial rosemary with grey nursery pot",
      variant: "FEJKA · 9 cm pot · 21 cm tall",
      source:
        "https://www.ikea.com/ph/en/images/products/fejka-artificial-potted-plant-indoor-outdoor-rosemary__1467004_pe995612_s5.jpg?f=xl",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/ikea-fejka/0.webp",
      alt: "Artificial rosemary with grey nursery pot. FEJKA · 9 cm pot · 21 cm tall.",
    },
    {
      id: "1",
      caption: "Artificial leaf and stem detail",
      variant: "FEJKA rosemary · decorative cover pot shown is not included",
      source:
        "https://www.ikea.com/ph/en/images/products/fejka-artificial-potted-plant-indoor-outdoor-rosemary__1478100_pe999421_s5.jpg?f=xl",
      kind: "image",
      presentation: "photo",
      src: "/product-media/ikea-fejka/1.webp",
      alt: "Artificial leaf and stem detail. FEJKA rosemary · decorative cover pot shown is not included.",
    },
  ],
  "twelve-south-curve": [
    {
      id: "0",
      caption: "Curved aluminium laptop stand",
      variant: "Curve · matte black · laptop shown for context",
      source:
        "https://www.twelvesouth.com/cdn/shop/products/12S_Curve_Black_ChildHero.jpg?width=1200",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/twelve-south-curve/0.webp",
      alt: "Curved aluminium laptop stand. Curve · matte black · laptop shown for context.",
    },
    {
      id: "1",
      caption: "Curve in use · aluminium and silicone supports",
      variant: "Curve · matte black · laptop shown for context",
      source:
        "https://www.twelvesouth.com/cdn/shop/products/black_4_a53a7b3d-08fd-4acd-9e70-05bd26b2546f.jpg?width=1200",
      kind: "image",
      presentation: "photo",
      src: "/product-media/twelve-south-curve/1.webp",
      alt: "Curve in use · aluminium and silicone supports. Curve · matte black · laptop shown for context.",
    },
  ],
  "torq-mod-fun": [
    {
      id: "0",
      caption: "Mod Fun · Blue pinline · supplier shape reference",
      variant: "Supplier photo of 7′2″; 3D preview is the 6′8″ size",
      source:
        "https://www.torq-surfboards.com/files/PRODUCT%20PICS/TET/Fun%207%272/TQ22_TET_72_PINLINE_COLORBLUE.png",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/torq-mod-fun/0.webp",
      alt: "Mod Fun · Blue pinline · supplier shape reference. Supplier photo of 7′2″; 3D preview is the 6′8″ size.",
    },
    {
      id: "1",
      caption: "Alternative white pinline · supplier reference",
      variant: "7′2″ alternative color; differs from preview",
      source:
        "https://www.torq-surfboards.com/files/PRODUCT%20PICS/TET/Fun%207%272/TQ22_TET_72_PINLINE.png",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/torq-mod-fun/1.webp",
      alt: "Alternative white pinline · supplier reference. 7′2″ alternative color; differs from preview.",
    },
  ],
  "logitech-desk-mat": [
    {
      id: "0",
      caption: "Studio Desk Mat · Mid Grey",
      variant: "Mid Grey · Fabric and stitched edge",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/desk-mat-studio-series/gallery/2026-update/logitech-desk-mat-studio-series-mid-grey-top-angle-gallery-1.png",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/logitech-desk-mat/0.webp",
      alt: "Studio Desk Mat · Mid Grey. Mid Grey · Fabric and stitched edge.",
    },
    {
      id: "1",
      caption: "Fabric surface and rubber base",
      variant: "Mid Grey · Curled material detail",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/desk-mat-studio-series/gallery/2026-update/logitech-desk-mat-studio-series-mid-grey-top-angle-curl-gallery-6.png",
      kind: "image",
      presentation: "photo",
      src: "/product-media/logitech-desk-mat/1.webp",
      alt: "Fabric surface and rubber base. Mid Grey · Curled material detail.",
    },
  ],
  "logitech-mouse-pad": [
    {
      id: "0",
      caption: "Studio Mouse Pad · Dark Rose",
      variant: "Dark Rose · Top view",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mouse-pad-studio-series/gallery/logitech-mouse-pad-studio-series-top-view-dark-rose.png",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/logitech-mouse-pad/0.webp",
      alt: "Studio Mouse Pad · Dark Rose. Dark Rose · Top view.",
    },
    {
      id: "1",
      caption: "Stitched fabric and anti-slip base",
      variant: "Dark Rose · Material detail",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mouse-pad-studio-series/gallery/logitech-mouse-pad-studio-series-curl-view-dark-rose.png",
      kind: "image",
      presentation: "photo",
      src: "/product-media/logitech-mouse-pad/1.webp",
      alt: "Stitched fabric and anti-slip base. Dark Rose · Material detail.",
    },
  ],
  "logitech-mx-keys-mini": [
    {
      id: "0",
      caption: "MX Keys Mini · Graphite",
      variant: "Graphite · US layout · Top view",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/mx-keys-mini/gallery/us/mx-keys-mini-top-graphite-us.png",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/logitech-mx-keys-mini/0.webp",
      alt: "MX Keys Mini · Graphite. Graphite · US layout · Top view.",
    },
    {
      id: "1",
      caption: "Compact profile and sculpted keys",
      variant: "Graphite · US layout · Angled view",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/mx-keys-mini/gallery/us/mx-keys-mini-3q-tilted-graphite-us.png",
      kind: "image",
      presentation: "photo",
      src: "/product-media/logitech-mx-keys-mini/1.webp",
      alt: "Compact profile and sculpted keys. Graphite · US layout · Angled view.",
    },
  ],
  "logitech-mx-master-3s": [
    {
      id: "0",
      caption: "MX Master 3S Bluetooth Edition",
      variant: "Graphite · Front angle",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-left-front-view-graphite-new-8.png",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/logitech-mx-master-3s/0.webp",
      alt: "MX Master 3S Bluetooth Edition. Graphite · Front angle.",
    },
    {
      id: "1",
      caption: "Thumb rest and side scroll wheel",
      variant: "Graphite · Side profile",
      source:
        "https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-left-profile-view-graphite-new-4.png",
      kind: "image",
      presentation: "photo",
      src: "/product-media/logitech-mx-master-3s/1.webp",
      alt: "Thumb rest and side scroll wheel. Graphite · Side profile.",
    },
  ],
  "elgato-stream-deck-mk2": [
    {
      id: "0",
      caption: "Stream Deck MK.2 · Black",
      variant: "MK.2 · Official photo with detachable stand",
      source: "https://help.elgato.com/hc/article_attachments/4405169706637",
      kind: "image",
      presentation: "catalog",
      src: "/product-media/elgato-stream-deck-mk2/0.webp",
      alt: "Stream Deck MK.2 · Black. MK.2 · Official photo with detachable stand.",
    },
    {
      id: "1",
      caption: "MK.2 interchangeable faceplate",
      variant: "MK.2 · Unit without stand · Faceplate instructions",
      source: "https://help.elgato.com/hc/article_attachments/4405494589581",
      kind: "image",
      presentation: "photo",
      src: "/product-media/elgato-stream-deck-mk2/1.webp",
      alt: "MK.2 interchangeable faceplate. MK.2 · Unit without stand · Faceplate instructions.",
    },
  ],
};
