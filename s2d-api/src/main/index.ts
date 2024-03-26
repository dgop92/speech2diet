try {
  // if you execute the app using cross-env, it will load the env-vars file based on the NODE_ENV variable
  // if NODE_ENV is not set, the env vars must had been loaded using -r flag
  require("dotenv").config({ path: `./env-vars/.${process.env.NODE_ENV}.env` });
} catch (error) {}

import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { AppModule } from "./nest/app.module";
import { AllExceptionsFilter } from "./nest/general-exception-filter";
import { setupFactories } from "./setup-factories";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import {
  getAuthFirebaseClient,
  getFirebaseApp,
  getFirestoreClient,
} from "./firebase-app";

export async function startApp() {
  const firebaseApp = await getFirebaseApp();
  const authFirebaseClient = getAuthFirebaseClient(firebaseApp);
  const firestoreClient = getFirestoreClient(firebaseApp);

  setupFactories(authFirebaseClient, firestoreClient);

  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.enableCors({
    origin: APP_ENV_VARS.cors.allowOrigins,
  });
  await app.listen(APP_ENV_VARS.port);

  myLogger.info("app started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
