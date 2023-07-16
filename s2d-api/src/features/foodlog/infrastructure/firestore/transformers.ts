import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { FirestoreMealReportReview } from "./entities/meal-report-review.firestore";

export function firestoreMealReportReviewToDomain(
  firestoreMealReportReview: FirestoreMealReportReview
): MealReportReview {
  const { mealRecordedAt, ...rest } = firestoreMealReportReview;
  return {
    ...rest,
    mealRecordedAt: mealRecordedAt.toDate(),
  };
}
