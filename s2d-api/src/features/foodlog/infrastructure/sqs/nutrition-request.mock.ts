import { AppUser } from "@features/auth/entities/app-user";
import {
  NutritionRequestMessage,
  NutritionRequestMessageCreateInputSchema,
} from "@features/foodlog/entities/nutrition-request-message";
import { INutritionRequestPublisher } from "@features/foodlog/ports/nutrition-request-publisher.definition";
import { NutritionRequestMessageCreateInput } from "@features/foodlog/schema-types";
import Joi from "joi";
import { DBLookupPreference } from "@features/foodlog/entities/meal-report-review";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class MockNutritionRequestPublisher
  implements INutritionRequestPublisher
{
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

    myLogger.info("sending message to sqs", { message });
    // we do nothing here, it is just a mock
    myLogger.info("message sent to sqs", { message });
    return message;
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
