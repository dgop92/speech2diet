import { Food } from "./food";
import Joi from "joi";
import { FoodCreateInputSchema } from "./food";

export class FoodItem {
  /** the id that identifies the food item */
  id: string;
  /** The food object */
  food: Food;
  /** The score of the food record, the higher the score the more likely the food is the correct food */
  score: number;
  /** Amount in the food's portion reference unit. If amount is 0, then the amount could not be computed */
  amount: number;
  /** Whether the unit was transformed from the user's unit to the food's portion reference unit */
  unitWasTransformed: boolean;
  /** Whether the amount was modify by the user manually using the app.
   * Useful to know if the amount was modified because the user made a mistake or because the user wanted to add more/less of the food
   */
  amountByUser: boolean;
}

export const FoodItemCreateInputSchema = Joi.object({
  food: FoodCreateInputSchema.required(),
  score: Joi.number().min(0).required(),
  amount: Joi.number().min(0).required(),
  unitWasTransformed: Joi.boolean().required(),
}).meta({ className: "FoodItemCreateInput" });

export const FoodItemUpdateInputSchema = Joi.object({
  searchBy: Joi.object({
    mealReportReviewId: Joi.string().required(),
    foodReportReviewId: Joi.string().required(),
  }).required(),
  data: Joi.object({
    amount: Joi.number().positive().required(),
  }).required(),
}).meta({ className: "FoodItemUpdateInput" });

export const FoodItemSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().required(),
    mealReportReviewId: Joi.string().required(),
    foodReportReviewId: Joi.string().required(),
  }).required(),
}).meta({ className: "FoodItemSearchInput" });
