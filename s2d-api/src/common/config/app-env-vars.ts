import {
  getOsEnv,
  getOsEnvOrDefault,
  parseIntOrThrow,
  parseListOrDefault,
} from "./env-utils";

export const APP_ENV_VARS = {
  NODE_ENV: getOsEnv("NODE_ENV"),
  isProduction: getOsEnv("NODE_ENV") === "prod",
  isTest: getOsEnv("NODE_ENV") === "test",
  port: parseIntOrThrow(process.env.PORT || getOsEnv("APP_PORT")),
  aws: {
    s3: {
      bucket: getOsEnv("AWS_S3_BUCKET"),
    },
    sqs: {
      nutritionRequestQueueUrl: getOsEnv("AWS_NUTRITION_REQUEST_QUEUE_URL"),
    },
    region: getOsEnv("AWS_REGION"),
    accessKeyId: getOsEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getOsEnv("AWS_SECRET_ACCESS_KEY"),
  },
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
