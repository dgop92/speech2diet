import { AppLogger } from "@common/logging/logger";
import { Firestore } from "firebase-admin/firestore";
import { IFoodItemRepository } from "../ports/food-item.repository.definition";
import { IFoodItemUseCase } from "../ports/food-item.use-case.definition";
import { FirestoreMealReportReview } from "../infrastructure/firestore/entities/meal-report-review.firestore";
import { createFirestoreCollection } from "@common/firebase/utils";
import { FoodItemRepository } from "../infrastructure/firestore/repositories/food-item.repository";
import { FoodItemUseCase } from "../use-cases/food-item.use-case";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let foodItemRepository: IFoodItemRepository;
let foodItemUseCase: IFoodItemUseCase;

export const myFoodItemFactory = (firestore?: Firestore) => {
  myLogger.info("calling foodItemFactory");

  if (firestore !== undefined && foodItemRepository === undefined) {
    myLogger.info("creating foodItemRepository");
    const collection = createFirestoreCollection<FirestoreMealReportReview>(
      firestore,
      "meal-report-reviews"
    );
    foodItemRepository = new FoodItemRepository(collection);
    myLogger.info("foodItemRepository created");
  }

  if (foodItemUseCase === undefined) {
    myLogger.info("creating foodItemUseCase");
    foodItemUseCase = new FoodItemUseCase(foodItemRepository);
    myLogger.info("foodItemUseCase created");
  }

  return {
    foodItemRepository,
    foodItemUseCase,
  };
};
