export type ReviewScore = 1 | 2 | 3 | 4 | 5;
export type ReviewFilter = "all" | ReviewScore;

export type DemoProductReview = {
  id: string;
  author: string;
  rating: ReviewScore;
  title: string;
  comment: string;
};

export type DemoReviewSummary = {
  reviews: readonly DemoProductReview[];
  average: number;
  counts: Record<ReviewScore, number>;
};
