import {
  getOsEnv,
  getOsEnvOrDefault,
  parseIntOrThrow,
  parseListOrDefault,
} from "./env-utils";

function getAppConfiguration() {
  const nodeEnv = getOsEnv("NODE_ENV");

  const isProduction = nodeEnv === "prod";
  const isTest = nodeEnv === "test";

  const port = parseIntOrThrow(process.env.PORT || getOsEnv("APP_PORT"));

  const awsRegion = getOsEnv("AWS_REGION");
  const awsAccessKeyId = getOsEnvOrDefault("AWS_ACCESS_KEY_ID", "");
  const awsSecretAccessKey = getOsEnvOrDefault("AWS_SECRET_ACCESS_KEY", "");

  const nutritionRequestQueueUrl = getOsEnvOrDefault(
    "AWS_NUTRITION_REQUEST_QUEUE_URL",
    ""
  );
  const s3Bucket = getOsEnvOrDefault("AWS_S3_BUCKET", "");

  if (!isTest && s3Bucket === "") {
    throw new Error(
      "AWS_S3_BUCKET environment variable is required for non testing environments"
    );
  }

  if (!isTest && nutritionRequestQueueUrl === "") {
    throw new Error(
      "AWS_NUTRITION_REQUEST_QUEUE_URL environment variable is required for non testing environments"
    );
  }

  const firebaseAuthEmulatorHost = getOsEnvOrDefault(
    "FIREBASE_AUTH_EMULATOR_HOST",
    ""
  );
  const firebaseFirestoreEmulatorHost = getOsEnvOrDefault(
    "FIREBASE_FIRESTORE_EMULATOR_HOST",
    ""
  );

  const loggingLevel = getOsEnvOrDefault("LOG_LEVEL", "info");

  const corsAllowOrigins = parseListOrDefault(
    getOsEnvOrDefault("CORS_ALLOW_ORIGINS", ""),
    "*"
  );

  return {
    NODE_ENV: nodeEnv,
    isProduction,
    isTest,
    port,
    aws: {
      region: awsRegion,
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
      s3: {
        bucket: s3Bucket,
      },
      sqs: {
        nutritionRequestQueueUrl,
      },
    },
    firebase: {
      authEmulatorHost: firebaseAuthEmulatorHost,
      firestoreEmulatorHost: firebaseFirestoreEmulatorHost,
    },
    logging: {
      level: loggingLevel,
    },
    cors: {
      allowOrigins: corsAllowOrigins,
    },
  };
}

export const APP_ENV_VARS = getAppConfiguration();
