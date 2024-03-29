import { Firestore } from "firebase-admin/firestore";
import { myMealReportReviewFactory } from "./meal-report-review.factory";
import { myFoodReportReviewFactory } from "./food-report-review.factory";
import { myFoodItemFactory } from "./food-item.factory";
import { FoodItemUseCase } from "../use-cases/food-item.use-case";
import { FoodReportReviewUseCase } from "../use-cases/food-report-review.use-case";
import { myNutritionRequestPublisherFactory } from "./nutrition-request-publisher.factory";
import { myAudioStorageFactory } from "./audio-storage.factory";

export function foodlogFactory(fireStoreClient?: Firestore) {
  const mealReportReviewFactory = myMealReportReviewFactory(fireStoreClient);
  const foodReportReviewFactory = myFoodReportReviewFactory(fireStoreClient);
  const foodItemFactory = myFoodItemFactory(fireStoreClient);
  const nutritionRequestPublisherFactory = myNutritionRequestPublisherFactory();
  myAudioStorageFactory();

  const { mealReportReviewUseCase } = mealReportReviewFactory;
  const { foodReportReviewUseCase } = foodReportReviewFactory;
  const { foodItemUseCase } = foodItemFactory;

  (foodReportReviewUseCase as FoodReportReviewUseCase).setDependencies(
    mealReportReviewUseCase
  );
  (foodItemUseCase as FoodItemUseCase).setDependencies(mealReportReviewUseCase);

  return {
    mealReportReviewFactory,
    foodReportReviewFactory,
    foodItemFactory,
    nutritionRequestPublisherFactory,
  };
}
