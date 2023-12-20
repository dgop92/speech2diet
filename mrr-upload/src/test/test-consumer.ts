import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { setupFactories } from "main/setup-factories";
import {
  getTestFirebaseApp,
  getTestAuthFirebaseClient,
  getTestFirestoreClient,
} from "./test-firebase-app";

export async function startApp() {
  const firebaseApp = getTestFirebaseApp();
  const authFirebaseClient = getTestAuthFirebaseClient(firebaseApp);
  const firestoreClient = getTestFirestoreClient(firebaseApp);

  setupFactories(authFirebaseClient, firestoreClient);

  const { consumerAppFactory } = setupFactories(
    authFirebaseClient,
    firestoreClient
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
