"use client";
import { useState } from "react";
import { demoReviewSummary } from "@/lib/demo-product-reviews";
import type { Product } from "@/types/catalog";
import type { ReviewFilter } from "@/types/product-reviews";

export function useProductReviews(product: Product) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const summary = demoReviewSummary(product);
  const visible = summary.reviews.filter(
    (review) => filter === "all" || review.rating === filter,
  );
  return { ...summary, visible, filter, setFilter };
}
