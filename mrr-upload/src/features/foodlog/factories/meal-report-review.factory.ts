import { AppLogger } from "@common/logging/logger";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { MealReportReviewUseCase } from "../use-cases/meal-report-review.use-case";
import { IMealReportReviewRepository } from "../ports/meal-report-review.repository.definition";
import { MealReportReviewAxiosRepository } from "../infrastructure/external/meal-report-review.axios.repository";
import { APP_CONFIG_VARS } from "@common/config/app-config-vars";
import { MealReportReviewMockRepository } from "../infrastructure/external/meal-report-review.mock.repository";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let mealReportReviewUseCase: IMealReportReviewUseCase;
let mealReportRepository: IMealReportReviewRepository;

export const myMealReportReviewFactory = (createMrrEndpoint?: string) => {
  myLogger.info("calling mealReportReviewFactory");

  if (mealReportRepository === undefined) {
    if (APP_CONFIG_VARS.isTest) {
      myLogger.info("creating mock mealReportRepository");
      mealReportRepository = new MealReportReviewMockRepository();
      myLogger.info("mealReportRepository mock created");
    } else {
      if (createMrrEndpoint !== undefined) {
        myLogger.info("creating mealReportRepository");
        mealReportRepository = new MealReportReviewAxiosRepository(
          createMrrEndpoint
        );
        myLogger.info("mealReportRepository created");
      } else {
        throw new Error(
          "you must provide a createMrrEndpoint to create the mealReportRepository"
        );
      }
    }
  }

  if (mealReportReviewUseCase === undefined) {
    myLogger.info("creating mealReportReviewUseCase");
    mealReportReviewUseCase = new MealReportReviewUseCase(mealReportRepository);
    myLogger.info("mealReportReviewUseCase created");
  }

  return {
    mealReportReviewUseCase,
  };
};
