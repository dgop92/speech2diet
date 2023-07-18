import { createFirestoreCollection } from "@common/firebase/utils";
import { AppLogger } from "@common/logging/logger";
import { Firestore } from "firebase-admin/firestore";
import { IFoodReportReviewUseCase } from "../ports/food-report-review.use-case.definition";
import { IFoodReportReviewRepository } from "../ports/food-report-review.repository.definition";
import { FirestoreMealReportReview } from "../infrastructure/firestore/entities/meal-report-review.firestore";
import { FoodReportReviewRepository } from "../infrastructure/firestore/repositories/food-report-review.repository";
import { FoodReportReviewUseCase } from "../use-cases/food-report-review.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let foodReportReviewRepository: IFoodReportReviewRepository;
let foodReportReviewUseCase: IFoodReportReviewUseCase;

export const myFoodReportReviewFactory = (repository?: Firestore) => {
  myLogger.info("calling foodReportReviewFactory");

  if (repository !== undefined && foodReportReviewRepository === undefined) {
    myLogger.info("creating foodReportReviewRepository");
    const collection = createFirestoreCollection<FirestoreMealReportReview>(
      repository,
      "meal-report-reviews"
    );
    foodReportReviewRepository = new FoodReportReviewRepository(collection);
    myLogger.info("foodReportReviewRepository created");
  }

  if (foodReportReviewUseCase === undefined) {
    myLogger.info("creating foodReportReviewUseCase");
    foodReportReviewUseCase = new FoodReportReviewUseCase(
      foodReportReviewRepository
    );
    myLogger.info("foodReportReviewUseCase created");
  }

  return {
    foodReportReviewRepository,
    foodReportReviewUseCase,
  };
};
