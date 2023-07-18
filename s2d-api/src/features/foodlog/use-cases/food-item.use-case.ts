import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { ApplicationError, ErrorCode } from "@common/errors";
import { IFoodItemUseCase } from "../ports/food-item.use-case.definition";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { IFoodItemRepository } from "../ports/food-item.repository.definition";
import { validateDataWithJoi } from "@common/validations";
import { FoodItem, FoodItemSearchInputSchema } from "../entities/food-item";
import { FoodItemSearchInput, FoodItemUpdateInput } from "../schema-types";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

async function getMRRRandFRR(
  mealReportReviewUseCase: IMealReportReviewUseCase,
  mrrId: string,
  frrId: string
) {
  myLogger.debug("getting meal report review", {
    mmrId: mrrId,
  });
  const mealReportReview = await mealReportReviewUseCase.getOneBy({
    searchBy: {
      id: mrrId,
    },
    options: {
      fetchFoodReports: true,
    },
  });

  if (!mealReportReview) {
    throw new ApplicationError(
      "mealReportReview not found",
      ErrorCode.NOT_FOUND
    );
  }

  myLogger.debug("getting food report review", {
    frrId: frrId,
  });
  const foodReportReview = mealReportReview.foodReports!.find(
    (foodReport) => foodReport.id === frrId
  );

  if (!foodReportReview) {
    throw new ApplicationError(
      "foodReportReview not found",
      ErrorCode.NOT_FOUND
    );
  }

  return { mealReportReview, foodReportReview };
}

export class FoodItemUseCase implements IFoodItemUseCase {
  private mealReportReviewUseCase: IMealReportReviewUseCase;

  constructor(private readonly repository: IFoodItemRepository) {}

  setDependencies(mealReportReviewUseCase: IMealReportReviewUseCase) {
    this.mealReportReviewUseCase = mealReportReviewUseCase;
  }

  changeFoundFoodBySuggestion(
    input: FoodItemSearchInput
  ): Promise<FoodItem | undefined>;
  changeFoundFoodBySuggestion(
    input: FoodItemSearchInput,
    transactionManager?: any
  ): Promise<FoodItem | undefined>;
  async changeFoundFoodBySuggestion(
    input: FoodItemSearchInput,
    transactionManager?: any
  ): Promise<FoodItem | undefined> {
    this.validateInput(FoodItemSearchInputSchema, input);
    // this is the food item id inside the suggestions list
    const suggestionId = input.searchBy.id;
    const mealReporReviewtId = input.searchBy.mealReporReviewtId;
    const foodReportReviewId = input.searchBy.foodReportReviewId;

    const { mealReportReview, foodReportReview } = await getMRRRandFRR(
      this.mealReportReviewUseCase,
      mealReporReviewtId,
      foodReportReviewId
    );

    myLogger.debug("getting food item", {
      fiId: suggestionId,
    });

    const foodItem = foodReportReview.systemResult.suggestions!.find(
      (foodItem) => foodItem.id === suggestionId
    );

    if (!foodItem) {
      throw new ApplicationError(
        "suggestion foodItem not found",
        ErrorCode.NOT_FOUND
      );
    }

    await this.repository.changeFoundFoodBySuggestion(
      foodItem,
      foodReportReview,
      mealReportReview,
      transactionManager
    );

    return foodItem;
  }

  updateFoundFood(input: FoodItemUpdateInput): Promise<FoodItem>;
  updateFoundFood(
    input: FoodItemUpdateInput,
    transactionManager?: any
  ): Promise<FoodItem>;
  async updateFoundFood(
    input: FoodItemUpdateInput,
    transactionManager?: any
  ): Promise<FoodItem> {
    const mealReporReviewtId = input.searchBy.mealReporReviewtId;
    const foodReportReviewId = input.searchBy.foodReportReviewId;

    const { mealReportReview, foodReportReview } = await getMRRRandFRR(
      this.mealReportReviewUseCase,
      mealReporReviewtId,
      foodReportReviewId
    );
    const foundFoodItem = foodReportReview.systemResult.foundFoodItem;

    if (!foundFoodItem) {
      throw new ApplicationError(
        "cannot update found food item, no food item found",
        ErrorCode.NOT_FOUND
      );
    }

    // update the found food item amount
    foundFoodItem.amount = input.data.amount;

    const updatedFoodItem = await this.repository.updateFoundFood(
      foundFoodItem,
      foodReportReview,
      mealReportReview,
      transactionManager
    );

    return updatedFoodItem;
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
