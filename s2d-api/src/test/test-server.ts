import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { TestModule } from "./nest/test.module";
import { AllExceptionsFilter } from "../main/nest/general-exception-filter";
import { setupFactories } from "main/setup-factories";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import {
  getTestFirebaseApp,
  getTestAuthFirebaseClient,
  getTestFirestoreClient,
} from "./test-firebase-app";

export async function startApp() {
  const firebaseApp = await getTestFirebaseApp();
  const authFirebaseClient = getTestAuthFirebaseClient(firebaseApp);
  const firestoreClient = getTestFirestoreClient(firebaseApp);

  setupFactories(authFirebaseClient, firestoreClient);

  const app = await NestFactory.create(TestModule);
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

  myLogger.info("test app started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
