import type { Product } from "../types/catalog.ts";
import type {
  DemoProductReview,
  DemoReviewSummary,
} from "../types/product-reviews.ts";

type ReviewCopy = Pick<DemoProductReview, "title" | "comment">;

// Fictional content for the preview UI, never manufacturer or customer data.
const reviewCopy: Record<string, readonly ReviewCopy[]> = {
  "desk-mat": [
    {
      title: "Brings the desk together",
      comment:
        "The grey surface ties my keyboard and mouse together without distracting from the rest of the setup.",
    },
    {
      title: "Plenty of room",
      comment:
        "The wide mat leaves space for both my keyboard and mouse. The stitched edge looks tidy in the close-up photos.",
    },
    {
      title: "Measure before choosing",
      comment:
        "It is wider than a regular mouse pad, so I would check how much room is left around the monitor stand.",
    },
  ],
  "mouse-pad": [
    {
      title: "A little color on the desk",
      comment:
        "The rose shade looks nice against a light tabletop. I like having a separate space for the mouse.",
    },
    {
      title: "Simple finishing touch",
      comment:
        "The close-up of the fabric and rubber base helped me picture the material in my setup.",
    },
    {
      title: "Good for a small workspace",
      comment:
        "The compact size fits beside my keyboard. I would choose the larger desk mat if I wanted more space.",
    },
  ],
  keyboard: [
    {
      title: "More space for everything else",
      comment:
        "The compact layout leaves plenty of room for my mouse and notebook. Graphite pairs nicely with the dark monitor.",
    },
    {
      title: "Easy to compare the layout",
      comment:
        "The top-down photo makes the US key layout easy to see before adding it to the desk.",
    },
    {
      title: "Keep the layout in mind",
      comment:
        "The small shape looks great, but there is no number pad. I would check whether that suits my daily work.",
    },
  ],
  mouse: [
    {
      title: "Fits the graphite setup",
      comment:
        "The finish matches the compact keyboard nicely. I like the sculpted shape beside a simple mouse pad.",
    },
    {
      title: "Useful close-up details",
      comment:
        "The side photo shows the thumb rest and second scroll wheel clearly. That helps more than the room view alone.",
    },
    {
      title: "Allow some space to move",
      comment:
        "It is larger than a travel mouse, so I would leave a clear area beside the keyboard.",
    },
  ],
  controller: [
    {
      title: "A home for my shortcuts",
      comment:
        "The small grid looks neat beside the keyboard and adds a little color to an otherwise quiet desk.",
    },
    {
      title: "The details are easy to see",
      comment:
        "The official photo shows the LCD keys and removable stand much more clearly than the room preview.",
    },
    {
      title: "Check the version",
      comment:
        "I like the compact size. The model notes helped me confirm this is the MK.2 rather than the newer keyboard-style version.",
    },
  ],
  desk: [
    {
      title: "Room to spread out",
      comment:
        "Enough space for my monitor and notebook without making the room feel crowded. The simple shape is easy to style.",
    },
    {
      title: "A cleaner workspace",
      comment:
        "I like the understated finish. It pairs nicely with a dark chair and a few small desk accessories.",
    },
    {
      title: "Check your room size first",
      comment:
        "The tabletop looks great, but I would measure the walkway around it before choosing this size.",
    },
  ],
  chair: [
    {
      title: "Fits the setup beautifully",
      comment:
        "The open back keeps the workspace looking light. I like how it sits with a simple desk and a warm floor.",
    },
    {
      title: "The details make a difference",
      comment:
        "Seeing the close-up photos helped me understand the texture and frame much better than the room preview alone.",
    },
    {
      title: "Worth checking the dimensions",
      comment:
        "A good match for the room. I would still check the seat height and arm clearance against my desk.",
    },
  ],
  monitor: [
    {
      title: "A tidy desk upgrade",
      comment:
        "The slim frame works well in this setup. There is still room beside the screen for a lamp and a notebook.",
    },
    {
      title: "Great proportions",
      comment:
        "I like the balance between the screen and the desk. The product photos make the stand and finish easy to see.",
    },
    {
      title: "Plan for the stand",
      comment:
        "Looks clean from the front. Remember to allow space for the stand when choosing where to place it.",
    },
  ],
  lamp: [
    {
      title: "A nice finishing touch",
      comment:
        "The shape adds a little character without taking over the desk. It works nicely next to the monitor.",
    },
    {
      title: "Easy to picture in the room",
      comment:
        "The close-up photos helped me compare the real finish with the rest of the workspace.",
    },
    {
      title: "Leave some space to adjust it",
      comment:
        "I like the design. I would keep a little extra room around the arm so it is easy to reposition.",
    },
  ],
  plant: [
    {
      title: "A little green goes a long way",
      comment:
        "A small detail that makes the desk feel more welcoming. The pot is easy to pair with the other accessories.",
    },
    {
      title: "The right scale for a desk",
      comment:
        "I like how it adds texture without blocking the screen or taking up much workspace.",
    },
    {
      title: "Keep the leaf spread in mind",
      comment:
        "Looks lovely in the corner. I would leave a bit of room around the leaves rather than squeezing it between objects.",
    },
  ],
  stand: [
    {
      title: "Keeps the desk looking light",
      comment:
        "The open shape fits the room nicely and leaves the tabletop feeling less cluttered.",
    },
    {
      title: "A simple, useful detail",
      comment:
        "I like the clean finish. The close-up photo makes the curve and supports much easier to understand.",
    },
    {
      title: "Check the fit first",
      comment:
        "A nice addition to the setup. I would compare the support dimensions with my laptop before choosing it.",
    },
  ],
  surfboard: [
    {
      title: "Makes the whole wall feel different",
      comment:
        "The blue pinline adds just enough color. I love the horizontal display above the desk rather than filling the wall with small decorations.",
    },
    {
      title: "A good match for this room",
      comment:
        "The clean shape works really well with the light wood and green wall. The full-size photo helped me picture the finish.",
    },
    {
      title: "Measure the wall before styling",
      comment:
        "A great focal point, but it needs some breathing room. The size notes helped me check the space above the monitor.",
    },
  ],
};

const reviewers = [
  { author: "Maya R.", rating: 5 },
  { author: "Andi P.", rating: 5 },
  { author: "Lina S.", rating: 4 },
] as const;

export function demoReviewSummary(product: Product): DemoReviewSummary {
  const copy = reviewCopy[product.kind ?? product.category] ?? reviewCopy.desk;
  const reviews = reviewers.map((reviewer, index) => ({
    ...reviewer,
    ...copy[index],
    id: `${product.id}-demo-${index}`,
  }));
  const counts: DemoReviewSummary["counts"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) counts[review.rating] += 1;
  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return { reviews, average, counts };
}
