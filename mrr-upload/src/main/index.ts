import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { setupFactories } from "./setup-factories";
import { myConsumerAppFactory } from "@features/foodlog/factories/consumer.factory";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";

export async function startApp() {
  await setupFactories();
  const mealReportReviewFactory = myMealReportReviewFactory();
  const consumerAppFactory = myConsumerAppFactory(
    mealReportReviewFactory.mealReportReviewUseCase
  );

  consumerAppFactory.consumerApp.on("error", (err) => {
    myLogger.error("an unexpected error occurred", err);
  });

  myLogger.info("starting consumer app");
  consumerAppFactory.consumerApp.start();
  myLogger.info("consumer started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
