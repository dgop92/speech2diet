import Joi from "joi";
import { MealReportReview } from "./meal-report-review";

export interface NutritionalInfo {
  calories: number;
  fat: number;
  protein: number;
  carbohydrates: number;
}

export interface MealReportReviewWithNutritionalInfo {
  mrr: MealReportReview;
  nutritionalInfo: NutritionalInfo;
}

export const NutritionalInfoBetweenDateInputSchema = Joi.object({
  mealRecordedStart: Joi.date().iso().required(),
  mealRecordedEnd: Joi.date().iso().required(),
}).meta({ className: "NutritionalInfoMRRBetweenDateInput" });
