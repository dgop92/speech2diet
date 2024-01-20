import { SQSClient } from "@aws-sdk/client-sqs";
import { APP_CONFIG_VARS } from "@common/config/app-config-vars";
import { AppLogger } from "@common/logging/logger";
import { Consumer } from "sqs-consumer";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { handleMRRMessageForSQSConsumer } from "../infrastructure/sqs/sqs.consumer";

let consumerApp: Consumer;
let sqsClient: SQSClient;
const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export const myConsumerAppFactory = (
  mealReportReviewUseCase: IMealReportReviewUseCase
) => {
  myLogger.info("calling myConsumerAppFactory");

  if (sqsClient === undefined) {
    myLogger.info("creating sqsClient");
    sqsClient = new SQSClient();
    myLogger.info("sqsClient created");
  }

  if (consumerApp === undefined && sqsClient !== undefined) {
    myLogger.info("creating consumerApp");
    consumerApp = Consumer.create({
      queueUrl: APP_CONFIG_VARS.aws.sqs.nutritionResponseQueueUrl,
      sqs: sqsClient,
      handleMessage: async (message) => {
        return handleMRRMessageForSQSConsumer(message, mealReportReviewUseCase);
      },
      batchSize: 1,
      pollingWaitTimeMs: APP_CONFIG_VARS.aws.sqs.pollingTime,
    });
    myLogger.info("consumerApp created");
  }

  return { consumerApp, sqsClient };
};
