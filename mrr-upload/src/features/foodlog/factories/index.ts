import { myMealReportReviewFactory } from "./meal-report-review.factory";

export function foodlogFactory() {
  const mealReportReviewFactory = myMealReportReviewFactory();

  return {
    mealReportReviewFactory,
  };
}
