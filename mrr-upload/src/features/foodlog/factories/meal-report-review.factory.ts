import { AppLogger } from "@common/logging/logger";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { MealReportReviewUseCase } from "../use-cases/meal-report-review.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let mealReportReviewUseCase: IMealReportReviewUseCase;

export const myMealReportReviewFactory = () => {
  myLogger.info("calling mealReportReviewFactory");

  if (mealReportReviewUseCase === undefined) {
    myLogger.info("creating mealReportReviewUseCase");
    mealReportReviewUseCase = new MealReportReviewUseCase();
    myLogger.info("mealReportReviewUseCase created");
  }

  return {
    mealReportReviewUseCase,
  };
};
