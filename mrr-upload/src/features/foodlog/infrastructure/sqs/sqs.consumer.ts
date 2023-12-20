import { Message } from "@aws-sdk/client-sqs";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import { NutritionInformationResponse } from "./entities/nutrition-information-response";
import { fromNutritionInformationResponseToMealReportReviewCreateInput } from "./adapter";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

// even if we fail processing the message we don't want to retry it, we don't have
// a dead letter queue and we don't want to keep trying to process the same message
// over and over again. That's the reason why we don't throw an error here.
export async function handleMRRMessage(
  message: Message,
  mealReportReviewUseCase: IMealReportReviewUseCase
): Promise<void> {
  myLogger.info("handling message", { messageId: message.MessageId });
  try {
    if (message.Body) {
      const body: NutritionInformationResponse = JSON.parse(message.Body);
      const data =
        fromNutritionInformationResponseToMealReportReviewCreateInput(body);
      const mealReportReview = await mealReportReviewUseCase.create(data);
      myLogger.info("created meal report review", {
        audioId: mealReportReview.audioId,
        appUserId: mealReportReview.appUserId,
      });
    } else {
      myLogger.warn("message has no body", { messageId: message.MessageId });
    }
  } catch (error) {
    myLogger.error("error handling message", {
      messageId: message.MessageId,
      errorMessage: error?.message || "no error message",
    });
  }
}
