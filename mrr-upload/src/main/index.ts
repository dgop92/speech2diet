import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { setupFactories } from "./setup-factories";
import {
  getAuthFirebaseClient,
  getFirebaseApp,
  getFirestoreClient,
} from "./firebase-app";

export async function startApp() {
  const firebaseApp = getFirebaseApp();
  const authFirebaseClient = getAuthFirebaseClient(firebaseApp);
  const firestoreClient = getFirestoreClient(firebaseApp);

  setupFactories(authFirebaseClient, firestoreClient);

  myLogger.info("app started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
