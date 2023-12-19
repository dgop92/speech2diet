import { Firestore } from "firebase-admin/firestore";
import { myMealReportReviewFactory } from "./meal-report-review.factory";

export function foodlogFactory(fireStoreClient?: Firestore) {
  const mealReportReviewFactory = myMealReportReviewFactory(fireStoreClient);

  return {
    mealReportReviewFactory,
  };
}
