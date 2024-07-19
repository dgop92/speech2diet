require("dotenv").config({ path: `./env-vars/.${process.env.NODE_ENV}.env` });
import { createDevLogger, WinstonLogger } from "@common/logging/winston-logger";
import {
  createNestApp,
  createSwaggerDocument,
  initializeFactories,
} from "./nest-app";
import { AppLogger } from "@common/logging/logger";
import fs from "node:fs";

export async function createAPISpec() {
  await initializeFactories();

  const app = await createNestApp();

  const document = createSwaggerDocument(app);
  fs.writeFileSync("./s2d-api-swagger-spec.json", JSON.stringify(document));
}

const logger = createDevLogger();
const winstonLogger = new WinstonLogger(logger);

AppLogger.getAppLogger().setLogger(winstonLogger);
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

myLogger.info("app logger created");

createAPISpec();
