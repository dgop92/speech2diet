import { AppLogger } from "@common/logging/logger";
import { INutritionRequestPublisher } from "../ports/nutrition-request-publisher.definition";
import { SQSNutritionRequestPublisher } from "../infrastructure/sqs/nutrition-request.sqs";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { MockNutritionRequestPublisher } from "../infrastructure/sqs/nutrition-request.mock";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let nutritionRequestPublisher: INutritionRequestPublisher;

export const myNutritionRequestPublisherFactory = () => {
  myLogger.info("calling nutritionRequestPublisherFactory");

  if (nutritionRequestPublisher === undefined) {
    if (APP_ENV_VARS.isTest) {
      myLogger.info("creating mock publisher");
      nutritionRequestPublisher = new MockNutritionRequestPublisher();
      myLogger.info("mock publisher created");
    } else {
      myLogger.info("creating sqs publisher");
      nutritionRequestPublisher = new SQSNutritionRequestPublisher(
        APP_ENV_VARS.aws.sqs.nutritionRequestQueueUrl
      );
      myLogger.info("publisher sqs created");
    }
  }

  return {
    nutritionRequestPublisher,
  };
};
