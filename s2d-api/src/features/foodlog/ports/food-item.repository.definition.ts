import { FoodItem } from "../entities/food-item";
import { FoodReportReview } from "../entities/food-report-review";
import { MealReportReview } from "../entities/meal-report-review";

export interface IFoodItemRepository {
  changeFoundFoodBySuggestion(
    foodItem: FoodItem,
    foodReport: FoodReportReview,
    mealReport: MealReportReview
  ): Promise<FoodItem | undefined>;
  changeFoundFoodBySuggestion(
    foodItem: FoodItem,
    foodReport: FoodReportReview,
    mealReport: MealReportReview,
    transactionManager?: any
  ): Promise<FoodItem | undefined>;
  updateFoundFood(
    foodItem: FoodItem,
    foodReport: FoodReportReview,
    mealReport: MealReportReview
  ): Promise<FoodItem>;
  updateFoundFood(
    foodItem: FoodItem,
    foodReport: FoodReportReview,
    mealReport: MealReportReview,
    transactionManager?: any
  ): Promise<FoodItem>;
}
