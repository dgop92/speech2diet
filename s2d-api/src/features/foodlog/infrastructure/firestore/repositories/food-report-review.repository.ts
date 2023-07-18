import { FirestoreCollection } from "@common/firebase/utils";
import { AppLogger } from "@common/logging/logger";
import { ErrorCode, RepositoryError } from "@common/errors";
import { Transaction } from "firebase-admin/firestore";
import { IFoodReportReviewRepository } from "@features/foodlog/ports/food-report-review.repository.definition";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { FoodReportReview } from "@features/foodlog/entities/food-report-review";
import { FirestoreMealReportReview } from "../entities/meal-report-review.firestore";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

function shouldThrowTransactionError(transactionManager: any) {
  if (transactionManager) {
    throw new RepositoryError(
      "transactions are not supported for this implementation",
      ErrorCode.NOT_IMPLEMENTED
    );
  }
}

export class FoodReportReviewRepository implements IFoodReportReviewRepository {
  constructor(
    private readonly collection: FirestoreCollection<FirestoreMealReportReview>
  ) {}

  removeFoodReportReview(
    foodReport: FoodReportReview,
    mealReport: MealReportReview
  ): Promise<void>;
  removeFoodReportReview(
    foodReport: FoodReportReview,
    mealReport: MealReportReview,
    transactionManager?: any
  ): Promise<void>;
  async removeFoodReportReview(
    foodReport: FoodReportReview,
    mealReport: MealReportReview,
    transactionManager?: Transaction
  ): Promise<void> {
    myLogger.debug("remove food report review", {
      frrId: foodReport.id,
      mrrId: mealReport.id,
    });

    shouldThrowTransactionError(transactionManager);

    const newFoodReports = mealReport.foodReports!.filter(
      (frr) => frr.id !== foodReport.id
    );

    const mealReportReviewId = mealReport.id;
    const mealReportReviewDocRef = this.collection.doc(mealReportReviewId);
    await mealReportReviewDocRef.set(
      {
        foodReports: newFoodReports,
      },
      { merge: true }
    );
  }
}
