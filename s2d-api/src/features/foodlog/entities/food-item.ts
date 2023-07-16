import { Food } from "./food";
import Joi from "joi";

export interface FoodItem {
  id: string;
  /** The food object */
  food: Food;
  /** The score of the food record, the higher the score the more likely the food is the correct food */
  score: number;
  /** Amount in the food's portion unit. If amount is 0, then the amount could not be found because the unit was not found */
  amount: number;
  /** Whether the unit was transformed to the unit given by the food portion unit */
  unitWasTransformed: boolean;
  /** Whether the amount was given by the user */
  amountByUser: boolean;
}

export const FoodItemUpdateInputSchema = Joi.object({
  data: Joi.object({
    amount: Joi.number().positive().required(),
  }).required(),
}).meta({ className: "FoodItemUpdateInput" });

export const FoodItemSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().optional(),
  }).optional(),
}).meta({ className: "FoodItemSearchInput" });
