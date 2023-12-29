import { getOsEnv } from "./env-utils";

export function loadEnvironmentVariables(envname: string) {
  if (["dev", "test", "prod"].includes(envname)) {
    require("dotenv").config({ path: `./env-vars/.${envname}.env` });
  } else {
    throw new Error(`Invalid environment name: ${envname}`);
  }

  const config = {
    env: getOsEnv("ENVIROMENT"),
    appName: getOsEnv("APP_NAME"),
    region: getOsEnv("AWS_REGION"),
    accountId: getOsEnv("AWS_ACCOUNT_ID"),
  };
  return config;
}

export type BuildConfig = ReturnType<typeof loadEnvironmentVariables>;

export function loadS2NServiceVariables() {
  require("dotenv").config({ path: "./external-env-vars/s2n/.env" });

  const config = {
    MONGO_URL: getOsEnv("S2N_MONGO_URL"),
    DB_NAME: getOsEnv("S2N_DB_NAME"),
    LOGGING_CONFIG_FILE: getOsEnv("S2N_LOGGING_CONFIG_FILE"),
    MOCK_SERVICES: getOsEnv("S2N_MOCK_SERVICES"),
    OPENAI_KEY: getOsEnv("S2N_OPENAI_KEY"),
    OPENAI_ENGINE: getOsEnv("S2N_OPENAI_ENGINE"),
    DEEPGRAM_KEY: getOsEnv("S2N_DEEPGRAM_KEY"),
  };
  return config;
}

export type S2NServiceConfig = ReturnType<typeof loadS2NServiceVariables>;
