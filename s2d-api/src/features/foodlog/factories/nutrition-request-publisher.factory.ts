import { AppLogger } from "@common/logging/logger";
import { INutritionRequestPublisher } from "../ports/nutrition-request-publisher.definition";
import { SQSNutritionRequestPublisher } from "../infrastructure/sqs/nutrition-request.sqs";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let nutritionRequestPublisher: INutritionRequestPublisher;

export const myNutritionRequestPublisherFactory = () => {
  myLogger.info("calling nutritionRequestPublisherFactory");

  if (nutritionRequestPublisher === undefined) {
    myLogger.info("creating publisher");
    nutritionRequestPublisher = new SQSNutritionRequestPublisher();
    myLogger.info("publisher created");
  }

  return {
    nutritionRequestPublisher,
  };
};
