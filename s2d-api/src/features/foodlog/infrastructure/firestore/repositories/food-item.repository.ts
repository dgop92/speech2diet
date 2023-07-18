import { FirestoreCollection } from "@common/firebase/utils";
import { AppLogger } from "@common/logging/logger";
import { ErrorCode, RepositoryError } from "@common/errors";
import { IFoodItemRepository } from "@features/foodlog/ports/food-item.repository.definition";
import { FirestoreMealReportReview } from "../entities/meal-report-review.firestore";
import { FoodItem } from "@features/foodlog/entities/food-item";
import { FoodReportReview } from "@features/foodlog/entities/food-report-review";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { Transaction } from "firebase-admin/firestore";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

function shouldThrowTransactionError(transactionManager: any) {
  if (transactionManager) {
    throw new RepositoryError(
      "transactions are not supported for this implementation",
      ErrorCode.NOT_IMPLEMENTED
    );
  }
}

export class FoodItemRepository implements IFoodItemRepository {
  constructor(
    private readonly collection: FirestoreCollection<FirestoreMealReportReview>
  ) {}

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
  async changeFoundFoodBySuggestion(
    foodItem: FoodItem,
    foodReport: FoodReportReview,
    mealReport: MealReportReview,
    transactionManager?: Transaction
  ): Promise<FoodItem | undefined> {
    myLogger.debug("change found food item by suggestion", {
      frrId: foodReport.id,
      mrrId: mealReport.id,
      suggestionFoodItemId: foodItem.id,
    });
    // food item is the suggestion to change for the found food item

    shouldThrowTransactionError(transactionManager);

    myLogger.debug("change found food item by suggestion");
    const oldFoundFoodItem = foodReport.systemResult.foundFoodItem;
    const newSuggestions = foodReport.systemResult.suggestions.filter(
      (suggestion) => suggestion.id !== foodItem.id
    );
    myLogger.debug("add the old found food item to the suggestions if any", {
      oldFoundFoodItemExists: !!oldFoundFoodItem,
    });
    if (oldFoundFoodItem) {
      newSuggestions.push(oldFoundFoodItem);
    }

    const newFoodReportReview: FoodReportReview = {
      ...foodReport,
      systemResult: {
        foundFoodItem: foodItem,
        suggestions: newSuggestions,
      },
    };
    const newFoodReports = mealReport.foodReports!.map((frr) =>
      frr.id === foodReport.id ? newFoodReportReview : frr
    );

    const mealReportReviewId = mealReport.id;

    myLogger.debug("update meal report review", {
      mrrId: mealReportReviewId,
    });
    const mealReportReviewDocRef = this.collection.doc(mealReportReviewId);
    await mealReportReviewDocRef.set(
      {
        foodReports: newFoodReports,
      },
      { merge: true }
    );

    return foodItem;
  }

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
  async updateFoundFood(
    foodItem: FoodItem,
    foodReport: FoodReportReview,
    mealReport: MealReportReview,
    transactionManager?: Transaction
  ): Promise<FoodItem> {
    myLogger.debug("update found food item", {
      frrId: foodReport.id,
      mrrId: mealReport.id,
      foodItemId: foodItem.id,
    });

    shouldThrowTransactionError(transactionManager);

    const newFoodReportReview: FoodReportReview = {
      ...foodReport,
      systemResult: {
        foundFoodItem: foodItem,
        suggestions: foodReport.systemResult.suggestions,
      },
    };
    const newFoodReports = mealReport.foodReports!.map((frr) =>
      frr.id === foodReport.id ? newFoodReportReview : frr
    );

    const mealReportReviewId = mealReport.id;

    myLogger.debug("update meal report review", {
      mrrId: mealReportReviewId,
    });
    const mealReportReviewDocRef = this.collection.doc(mealReportReviewId);
    await mealReportReviewDocRef.set(
      {
        foodReports: newFoodReports,
      },
      { merge: true }
    );

    return foodItem;
  }
}
