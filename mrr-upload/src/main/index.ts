import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { setupFactories } from "./setup-factories";
import {
  getAuthFirebaseClient,
  getFirebaseApp,
  getFirestoreClient,
} from "./firebase-app";
import { myConsumerAppFactory } from "@features/foodlog/factories/consumer.factory";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";

export async function startApp() {
  const firebaseApp = await getFirebaseApp();
  const authFirebaseClient = getAuthFirebaseClient(firebaseApp);
  const firestoreClient = getFirestoreClient(firebaseApp);

  setupFactories(authFirebaseClient, firestoreClient);

  // no need to pass firestore, it was already setup in setupFactories
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
