import { myMealReportReviewFactory } from "./meal-report-review.factory";

export function foodlogFactory(createMrrEndpoint?: string) {
  const mealReportReviewFactory = myMealReportReviewFactory(createMrrEndpoint);

  return {
    mealReportReviewFactory,
  };
}
