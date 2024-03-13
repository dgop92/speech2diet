import Joi from "joi";

export enum FoodSource {
  USER_DB = "user_db",
  SYSTEM_DB = "system_db",
}

export interface Food {
  /** The id from the source database */
  id: string;
  /** The main name of the food */
  foodName: string;
  /** Other possible names that the food is known as */
  otherNames: string[];
  /** Attributes that describe the food, such as cooked, raw, etc */
  description: string[];
  /** The amount of food to compare the nutritional values */
  portionSize: number;
  /** The unit of the portion size */
  portionSizeUnit: string;
  /** The recommended amount of food to be consumed */
  servingSize: number;
  /** The unit of the serving size */
  servingSizeUnit: string;
  /** The source of the food, either from the user database or the system database */
  foodSource: FoodSource;
  /** The amount of calories in grams */
  calories: number;
  /** The amount of protein in grams */
  protein: number;
  /** The amount of fat in grams */
  fat: number;
  /** The amount of carbohydrates in grams */
  carbohydrates: number;
}

export const FoodCreateInputSchema = Joi.object({
  id: Joi.string().required(),
  foodName: Joi.string().required(),
  otherNames: Joi.array().items(Joi.string()).required(),
  description: Joi.array().items(Joi.string()).required(),
  portionSize: Joi.number().positive().required(),
  portionSizeUnit: Joi.string().required(),
  servingSize: Joi.number().positive().required(),
  servingSizeUnit: Joi.string().required(),
  calories: Joi.number().min(0).required(),
  protein: Joi.number().min(0).required(),
  fat: Joi.number().min(0).required(),
  carbohydrates: Joi.number().min(0).required(),
  foodSource: Joi.string()
    .valid(FoodSource.USER_DB, FoodSource.SYSTEM_DB)
    .required(),
}).meta({ className: "FoodCreateInput" });
