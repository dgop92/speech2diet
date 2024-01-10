import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { setupFactories } from "main/setup-factories";
import {
  getTestFirebaseApp,
  getTestAuthFirebaseClient,
  getTestFirestoreClient,
} from "./test-firebase-app";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { myConsumerAppFactory } from "@features/foodlog/factories/consumer.factory";

export async function startApp() {
  const firebaseApp = await getTestFirebaseApp();
  const authFirebaseClient = getTestAuthFirebaseClient(firebaseApp);
  const firestoreClient = getTestFirestoreClient(firebaseApp);

  setupFactories(authFirebaseClient, firestoreClient);

  // no need to pass firestore, it was already setup in setupFactories
  const mealReportReviewFactory = myMealReportReviewFactory();
  const consumerAppFactory = myConsumerAppFactory(
    mealReportReviewFactory.mealReportReviewUseCase
  );

  consumerAppFactory.consumerApp.on("error", (err) => {
    myLogger.error("an unexpected error occurred", err);
  });

  myLogger.info("starting test consumer app");
  consumerAppFactory.consumerApp.start();
  myLogger.info("test consumer started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
