import { FoodItem } from "./food-item";
import Joi from "joi";

export interface UserReport {
  foodName: string;
  /** The name of the food that the user reported */
  /** The description of the food that the user reported */
  description: string[];
  /** The amount of the food that the user reported */
  amount: number;
  /** The unit of the amount that the user reported */
  unit: string;
}

export interface SystemResult {
  foundFoodItem: FoodItem | null;
  suggestions: FoodItem[];
}

export interface FoodReportReview {
  id: string;
  userReport: UserReport;
  systemResult: SystemResult;
}

export const FoodReportReviewSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().optional(),
    mealReviewReportId: Joi.string().optional(),
  }).optional(),
}).meta({ className: "FoodReportReviewSearchInput" });
