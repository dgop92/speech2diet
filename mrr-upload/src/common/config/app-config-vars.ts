import { getOsEnv, getOsEnvOrDefault, parseIntOrThrow } from "./env-utils";

function getAppConfiguration() {
  const nodeEnv = getOsEnv("NODE_ENV");

  const isProduction = nodeEnv === "prod";
  const isTest = nodeEnv === "test";

  const awsRegion = getOsEnv("AWS_REGION");
  const awsAccessKeyId = getOsEnvOrDefault("AWS_ACCESS_KEY_ID", "");
  const awsSecretAccessKey = getOsEnvOrDefault("AWS_SECRET_ACCESS_KEY", "");
  const nutritionResponseQueueUrl = getOsEnvOrDefault(
    "AWS_NUTRITION_RESPONSE_QUEUE_URL",
    ""
  );
  const nutritionResponseQueuePollingTime = parseIntOrThrow(
    getOsEnvOrDefault("NUTRITION_RESPONSE_QUEUE_POLLING_TIME", "20000")
  );

  if (
    nutritionResponseQueueUrl !== "" &&
    (awsAccessKeyId == "" || awsSecretAccessKey == "")
  ) {
    throw new Error(
      "If you declare a response queue url you must declare the aws credentials, as you are going to use the consumer approach instead of lambda + sqs trigger"
    );
  }

  const loggingLevel = getOsEnvOrDefault("LOG_LEVEL", "info");

  return {
    isProduction,
    isTest,
    aws: {
      sqs: {
        nutritionResponseQueueUrl,
        pollingTime: nutritionResponseQueuePollingTime,
      },
      region: awsRegion,
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
    logging: {
      level: loggingLevel,
    },
  };
}

export const APP_CONFIG_VARS = getAppConfiguration();
