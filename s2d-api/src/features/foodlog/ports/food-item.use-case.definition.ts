import { AppUser } from "@features/auth/entities/app-user";
import { FoodItem } from "../entities/food-item";
import { FoodItemUpdateInput, FoodItemSearchInput } from "../schema-types";

export interface IFoodItemUseCase {
  changeFoundFoodBySuggestion(
    input: FoodItemSearchInput,
    appUser: AppUser
  ): Promise<FoodItem | undefined>;
  changeFoundFoodBySuggestion(
    input: FoodItemSearchInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<FoodItem | undefined>;
  updateFoundFood(
    input: FoodItemUpdateInput,
    appUser: AppUser
  ): Promise<FoodItem>;
  updateFoundFood(
    input: FoodItemUpdateInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<FoodItem>;
}
