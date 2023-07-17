import { FoodReportReview } from "../entities/food-report-review";
import { MealReportReview } from "../entities/meal-report-review";

export interface IFoodReportReviewRepository {
  removeFoodReportReview(
    foodReport: FoodReportReview,
    mealReport: MealReportReview
  ): Promise<void>;
  removeFoodReportReview(
    foodReport: FoodReportReview,
    mealReport: MealReportReview,
    transactionManager?: any
  ): Promise<void>;
}
