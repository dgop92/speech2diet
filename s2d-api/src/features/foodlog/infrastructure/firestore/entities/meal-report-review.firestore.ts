import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { Timestamp } from "firebase-admin/firestore";

// userId is used as the document identifier
export type FirestoreMealReportReview = Omit<
  MealReportReview,
  "mealRecordedAt"
> & {
  mealRecordedAt: Timestamp;
};
