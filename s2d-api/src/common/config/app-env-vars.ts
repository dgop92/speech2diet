import {
  getOsEnv,
  getOsEnvOrDefault,
  getOsPath,
  parseIntOrThrow,
  parseListOrDefault,
} from "./env-utils";

export const APP_ENV_VARS = {
  NODE_ENV: getOsEnv("NODE_ENV"),
  isProduction: getOsEnv("NODE_ENV") === "prod",
  isTest: getOsEnv("NODE_ENV") === "test",
  port: parseIntOrThrow(process.env.PORT || getOsEnv("APP_PORT")),
  firebase: {
    credentialsContent: getOsEnv("GOOGLE_APPLICATION_CREDENTIALS_CONTENT"),
    authEmulatorHost: getOsEnvOrDefault("FIREBASE_AUTH_EMULATOR_HOST", ""),
    firestoreEmulatorHost: getOsEnvOrDefault(
      "FIREBASE_FIRESTORE_EMULATOR_HOST",
      ""
    ),
  },
  logging: {
    level: getOsEnvOrDefault("LOG_LEVEL", "info"),
  },
  cors: {
    allowOrigins: parseListOrDefault(
      getOsEnvOrDefault("CORS_ALLOW_ORIGINS", ""),
      "*"
    ),
  },
};
