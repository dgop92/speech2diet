import { AppUser } from "@features/auth/entities/app-user";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { MealReportReview } from "../entities/meal-report-review";
import {
  MealReportReviewWithNutritionalInfo,
  NutritionalInfo,
  NutritionalInfoBetweenDateInputSchema,
} from "../entities/nutritional-info";
import { ApplicationError, ErrorCode } from "@common/errors";
import { FoodItem } from "../entities/food-item";
import { validateDataWithJoi } from "@common/validations";
import Joi from "joi";

type Nutrient = "calories" | "fat" | "protein" | "carbohydrates";

function getFinalNutrientAmount(
  foodItem: FoodItem | null,
  valueKey: Nutrient
): number {
  if (foodItem === null) {
    return 0;
  }

  const amountConsumed = foodItem.amount;
  const nutrientValue = foodItem.food[valueKey];
  const portionSize = foodItem.food.portionSize;

  return (amountConsumed * nutrientValue) / portionSize;
}

function getNutritionalInfo(mrr: MealReportReview): NutritionalInfo {
  const foodReports = mrr.foodReports;

  if (foodReports === undefined) {
    throw new ApplicationError(
      "food reports were not fetched for the meal report review",
      ErrorCode.UNEXPECTED_ERROR
    );
  }
  const nutrientInfo: NutritionalInfo = {
    calories: 0,
    fat: 0,
    protein: 0,
    carbohydrates: 0,
  };

  const nutrientKeys: Nutrient[] = [
    "calories",
    "fat",
    "protein",
    "carbohydrates",
  ];

  for (const foodReport of foodReports) {
    for (const key of nutrientKeys) {
      nutrientInfo[key] += getFinalNutrientAmount(
        foodReport.systemResult.foundFoodItem,
        key
      );
    }
  }

  return nutrientInfo;
}

export class NutritionalInfoUseCase {
  constructor(private readonly mrrUseCase: IMealReportReviewUseCase) {}

  async getNutritionalInfo(
    mealReportReviewId: string,
    appUser: AppUser
  ): Promise<MealReportReviewWithNutritionalInfo> {
    const mealReportReview = await this.mrrUseCase.getOneBy(
      {
        searchBy: { id: mealReportReviewId },
        options: { fetchFoodReports: true },
      },
      appUser
    );

    if (!mealReportReview) {
      throw new ApplicationError(
        "meal report review was not found",
        ErrorCode.NOT_FOUND
      );
    }

    return {
      mrr: mealReportReview,
      nutritionalInfo: getNutritionalInfo(mealReportReview),
    };
  }

  async getNutritionalInfoBetweenDates(
    startDate: string,
    endDate: string,
    appUser: AppUser
  ): Promise<NutritionalInfo> {
    const newInput = this.validateInput(NutritionalInfoBetweenDateInputSchema, {
      mealRecordedStart: startDate,
      mealRecordedEnd: endDate,
    });
    const mealReports = await this.mrrUseCase.getManyBy(
      {
        options: {
          fetchFoodReports: true,
        },
        searchBy: {
          pending: false,
        },
        filterBy: {
          // TODO: modify the type for MealReportReviewSearchInput and
          // create a different for the repository layer
          // @ts-ignore: a quick fix,
          mealRecordedEnd: newInput.mealRecordedEnd,
          // @ts-ignore
          mealRecordedStart: newInput.mealRecordedStart,
        },
      },
      appUser
    );

    const nutrientInfoOfAllMeals: NutritionalInfo[] =
      mealReports.map(getNutritionalInfo);

    const finalNutrientInfo: NutritionalInfo = nutrientInfoOfAllMeals.reduce(
      (acc, curr) => {
        return {
          calories: acc.calories + curr.calories,
          fat: acc.fat + curr.fat,
          protein: acc.protein + curr.protein,
          carbohydrates: acc.carbohydrates + curr.carbohydrates,
        };
      },
      {
        calories: 0,
        fat: 0,
        protein: 0,
        carbohydrates: 0,
      }
    );

    return finalNutrientInfo;
  }

  private validateInput<T = any>(schema: Joi.ObjectSchema<T>, input: any) {
    const value = validateDataWithJoi(schema, input);
    return value;
  }
}
