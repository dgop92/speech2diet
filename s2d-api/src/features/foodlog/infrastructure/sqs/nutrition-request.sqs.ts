import { AppUser } from "@features/auth/entities/app-user";
import {
  NutritionRequestMessage,
  NutritionRequestMessageCreateInputSchema,
} from "@features/foodlog/entities/nutrition-request-message";
import { INutritionRequestPublisher } from "@features/foodlog/ports/nutrition-request-publisher.definition";
import { NutritionRequestMessageCreateInput } from "@features/foodlog/schema-types";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import Joi from "joi";
import { DBLookupPreference } from "@features/foodlog/entities/meal-report-review";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class SQSNutritionRequestPublisher
  implements INutritionRequestPublisher
{
  private sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      region: APP_ENV_VARS.aws.region,
      credentials: {
        accessKeyId: APP_ENV_VARS.aws.accessKeyId,
        secretAccessKey: APP_ENV_VARS.aws.secretAccessKey,
      },
    });
  }

  async publish(
    input: NutritionRequestMessageCreateInput,
    appUser: AppUser
  ): Promise<NutritionRequestMessage> {
    this.validateInput(NutritionRequestMessageCreateInputSchema, input);
    const message: NutritionRequestMessage = {
      appUserId: appUser.id,
      audioId: input.data.audioId,
      // TODO: in the future we get this from the app user preferences
      dbLookupPreference: DBLookupPreference.SYSTEM_DB,
      mealRecordedAt: new Date(),
    };
    const messageBody = JSON.stringify(message);
    const params = {
      MessageBody: messageBody,
      QueueUrl: APP_ENV_VARS.aws.sqs.nutritionRequestQueueUrl,
    };
    const command = new SendMessageCommand(params);
    myLogger.info("sending message to sqs", { message });
    await this.sqsClient.send(command);
    myLogger.info("message sent to sqs", { message });
    return message;
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
