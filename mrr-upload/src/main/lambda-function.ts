require("../../scripts/prod-setup");
import { Handler, SQSEvent } from "aws-lambda";
import { setupFactories } from "./setup-factories";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { AppLogger } from "@common/logging/logger";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { NutritionInformationResponse } from "@features/foodlog/infrastructure/sqs/entities/nutrition-information-response";
import { fromNutritionInformationResponseToMealReportReviewCreateInput } from "@features/foodlog/infrastructure/sqs/adapter";
import { handleMRRMessage } from "@features/foodlog/use-cases/handle-mrr-message";

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export async function startApp() {
  myLogger.info("starting app");

  await setupFactories();
}

// even if we fail processing the message we don't want to retry it, we don't have
// a dead letter queue and we don't want to keep trying to process the same message
// over and over again. That's the reason why we don't throw an error here.
export const handler: Handler = async (event: SQSEvent, context) => {
  await startApp();

  if (event.Records.length === 0) {
    myLogger.warn("no records to process");
    return;
  }
  if (event.Records.length > 1) {
    myLogger.warn("this lambda function can only process one record at a time");
  }

  const mealReportReviewFactory = myMealReportReviewFactory();
  const record = event.Records[0];

  try {
    const body: NutritionInformationResponse = JSON.parse(record.body);
    const data =
      fromNutritionInformationResponseToMealReportReviewCreateInput(body);
    await handleMRRMessage(
      data,
      mealReportReviewFactory.mealReportReviewUseCase
    );
  } catch (error) {
    myLogger.error("error handling message", {
      messageId: record.messageId,
      errorMessage: error?.message || "no error message",
    });
  }
};
