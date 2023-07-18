import { FoodItem } from "../entities/food-item";
import { FoodItemUpdateInput, FoodItemSearchInput } from "../schema-types";

export interface IFoodItemUseCase {
  changeFoundFoodBySuggestion(
    input: FoodItemSearchInput
  ): Promise<FoodItem | undefined>;
  changeFoundFoodBySuggestion(
    input: FoodItemSearchInput,
    transactionManager?: any
  ): Promise<FoodItem | undefined>;
  updateFoundFood(input: FoodItemUpdateInput): Promise<FoodItem>;
  updateFoundFood(
    input: FoodItemUpdateInput,
    transactionManager?: any
  ): Promise<FoodItem>;
}
