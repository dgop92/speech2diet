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
  /** For USDA Foundation food reference units are in grams */
  portionReference: number;
  /** The unit of the portion reference */
  portionUnit: string;
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
