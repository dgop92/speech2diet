import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import { AppLogger } from "@common/logging/logger";
import { MealReportReviewCreateInput } from "../schema-types";
import { ApplicationError, ErrorCode } from "@common/errors";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export async function handleMRRMessage(
  mrrCreateInput: MealReportReviewCreateInput,
  mealReportReviewUseCase: IMealReportReviewUseCase
): Promise<void> {
  try {
    myLogger.info("creating meal report review", {
      audioId: mrrCreateInput.data.audioId,
      appUserId: mrrCreateInput.data.appUserId,
    });
    const mealReportReview = await mealReportReviewUseCase.create(
      mrrCreateInput
    );
    myLogger.info("created meal report review", {
      audioId: mealReportReview.audioId,
      appUserId: mealReportReview.appUserId,
    });
  } catch (error) {
    myLogger.error("error creating meal report review", {
      errorMessage: error?.message || "no error message",
    });
    throw new ApplicationError(
      "error creating meal report review",
      ErrorCode.UNEXPECTED_ERROR
    );
  }
}
