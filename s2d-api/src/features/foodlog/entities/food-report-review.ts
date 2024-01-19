import { FoodItem, FoodItemCreateInputSchema } from "./food-item";
import Joi from "joi";

export interface UserReport {
  /** The name of the food that the user reported */
  foodName: string;
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

export const FoodReportReviewCreateInputSchema = Joi.object({
  userReport: Joi.object({
    foodName: Joi.string().required(),
    description: Joi.array().items(Joi.string()).required(),
    amount: Joi.number().min(0).required(),
    unit: Joi.string().allow("").required(),
  }).required(),
  systemResult: Joi.object({
    foundFoodItem: FoodItemCreateInputSchema.allow(null).required(),
    suggestions: Joi.array().items(FoodItemCreateInputSchema).required(),
  }).required(),
}).meta({ className: "FoodReportReviewCreateInput" });

export const FoodReportReviewSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().required(),
    mealReviewReportId: Joi.string().required(),
  }).required(),
}).meta({ className: "FoodReportReviewSearchInput" });
