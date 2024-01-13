import { AppLogger } from "@common/logging/logger";
import { Firestore } from "firebase-admin/firestore";
import { IMealReportReviewRepository } from "../ports/meal-report-review.repository.definition";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { FirestoreMealReportReview } from "../infrastructure/firestore/entities/meal-report-review.firestore";
import {
  FirestoreCollection,
  createFirestoreCollection,
} from "@common/firebase/utils";
import { MealReportReviewRepository } from "../infrastructure/firestore/repositories/meal-report-review.repository";
import { MealReportReviewUseCase } from "../use-cases/meal-report-review.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let mealReportReviewRepository: IMealReportReviewRepository;
let mealReportReviewUseCase: IMealReportReviewUseCase;
let mealReportReviewCollection: FirestoreCollection<FirestoreMealReportReview>;

export const myMealReportReviewFactory = (firestore?: Firestore) => {
  myLogger.info("calling mealReportReviewFactory");

  if (firestore !== undefined && mealReportReviewRepository === undefined) {
    myLogger.info("creating mealReportReviewRepository");
    mealReportReviewCollection =
      createFirestoreCollection<FirestoreMealReportReview>(
        firestore,
        "meal-report-reviews"
      );
    mealReportReviewRepository = new MealReportReviewRepository(
      mealReportReviewCollection
    );
    myLogger.info("mealReportReviewRepository created");
  }

  if (mealReportReviewUseCase === undefined) {
    myLogger.info("creating mealReportReviewUseCase");
    mealReportReviewUseCase = new MealReportReviewUseCase(
      mealReportReviewRepository
    );
    myLogger.info("mealReportReviewUseCase created");
  }

  return {
    mealReportReviewRepository,
    mealReportReviewUseCase,
    mealReportReviewCollection,
  };
};
