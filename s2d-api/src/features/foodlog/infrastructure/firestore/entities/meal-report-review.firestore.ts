import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { Timestamp } from "firebase-admin/firestore";

export type FirestoreMealReportReview = Omit<
  MealReportReview,
  "mealRecordedAt"
> & {
  mealRecordedAt: Timestamp;
};
