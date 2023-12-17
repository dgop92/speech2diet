import Joi from "joi";
import { DBLookupPreference } from "./meal-report-review";

export interface NutritionRequestMessage {
  appUserId: string;
  audioId: string;
  dbLookupPreference: DBLookupPreference;
  mealRecordedAt: Date;
}

export const NutritionRequestMessageCreateInputSchema = Joi.object({
  data: Joi.object({
    audioId: Joi.string().required(),
  }).required(),
}).meta({ className: "NutritionRequestMessageCreateInput" });
