import { AppUser } from "@features/auth/entities/app-user";
import { NutritionRequestMessage } from "../entities/nutrition-request-message";
import { NutritionRequestMessageCreateInput } from "../schema-types";

export interface INutritionRequestPublisher {
  publish(
    input: NutritionRequestMessageCreateInput,
    appUser: AppUser
  ): Promise<NutritionRequestMessage>;
}
