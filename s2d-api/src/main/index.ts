try {
  // if you execute the app using cross-env, it will load the env-vars file based on the NODE_ENV variable
  // if NODE_ENV is not set, the env vars must had been loaded using -r flag
  require("dotenv").config({ path: `./env-vars/.${process.env.NODE_ENV}.env` });
} catch (error) {}

import { AppLogger } from "@common/logging/logger";
import { WinstonLogger, createDevLogger } from "@common/logging/winston-logger";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { SwaggerModule } from "@nestjs/swagger";
import {
  createNestApp,
  initializeFactories,
  createSwaggerDocument,
} from "./nest-app";

export async function startApp() {
  await initializeFactories();

  const app = await createNestApp();

  if (!APP_ENV_VARS.isProduction) {
    const document = createSwaggerDocument(app);
    SwaggerModule.setup("api", app, document);
  }

  await app.listen(APP_ENV_VARS.port);

  myLogger.info("app started");
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

startApp();
