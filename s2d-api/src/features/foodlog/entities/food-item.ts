import { Food } from "./food";
import Joi from "joi";
import { FoodCreateInputSchema } from "./food";

export interface UnitTransformationInfo {
  /** The original unit, the reported unit by the user. if unit is empty, the user did not report a unit  */
  originalUnit: string;
  /** The final unit, the unit given by the food portion unit */
  finalUnit: string;
  /** The factor used to transform the original unit to the final unit. 
    (factor * final unit) / original unit = final amount  */
  transformationFactor: number;
}

export interface FoodItem {
  id: string;
  /** The food object */
  food: Food;
  /** The score of the food record, the higher the score the more likely the food is the correct food */
  score: number;
  /** Amount in the food's portion unit. If amount is 0, then the amount could not be found because the unit was not found */
  amount: number;
  /** true if the unit was transformed to the unit given by the food portion unit */
  unitWasTransformed: boolean;
  /** true if the amount was given by the user */
  amountByUser: boolean;
  /** true if the serving size was used as the amount of the food */
  servingSizeWasUsed: boolean;
  /** Information about the transformation of the unit */
  unitTransformationInfo: UnitTransformationInfo | null;
}

export const UnitTransformationInfoSchema = Joi.object({
  originalUnit: Joi.string().allow("").required(),
  finalUnit: Joi.string().required(),
  transformationFactor: Joi.number().required(),
}).meta({ className: "UnitTransformationInfo" });

export const FoodItemCreateInputSchema = Joi.object({
  food: FoodCreateInputSchema.required(),
  score: Joi.number().min(0).required(),
  amount: Joi.number().min(0).required(),
  unitWasTransformed: Joi.boolean().required(),
  servingSizeWasUsed: Joi.boolean().required(),
  unitTransformationInfo: UnitTransformationInfoSchema.allow(null).required(),
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
