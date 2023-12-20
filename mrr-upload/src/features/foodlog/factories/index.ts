import { Firestore } from "firebase-admin/firestore";
import { myMealReportReviewFactory } from "./meal-report-review.factory";
import { myConsumerAppFactory } from "./consumer.factory";

export function foodlogFactory(fireStoreClient?: Firestore) {
  const mealReportReviewFactory = myMealReportReviewFactory(fireStoreClient);
  const mealReportReviewUseCase =
    mealReportReviewFactory.mealReportReviewUseCase;
  const consumerAppFactory = myConsumerAppFactory(mealReportReviewUseCase);

  return {
    mealReportReviewFactory,
    consumerAppFactory,
  };
}
