import { FoodSource } from "@features/foodlog/entities/food";
import { DBLookupPreference } from "@features/foodlog/entities/meal-report-review";

export class FoodCreateDTO {
  calories: number;
  carbohydrates: number;
  description: string[];
  fat: number;
  foodName: string;
  foodSource: FoodSource;
  id: string;
  otherNames: string[];
  portionSize: number;
  portionSizeUnit: string;
  protein: number;
  servingSize: number;
  servingSizeUnit: string;
}

export class FoodItemCreateDTO {
  amount: number;
  food: FoodCreateDTO;
  score: number;
  unitWasTransformed: boolean;
  servingSizeWasUsed: boolean;
  unitTransformationInfo: {
    originalUnit: string;
    finalUnit: string;
    transformationFactor: number;
  } | null;
}

export class FoodReportReviewCreateDTO {
  systemResult: {
    foundFoodItem: FoodItemCreateDTO | null;
    suggestions: FoodItemCreateDTO[];
  };
  userReport: {
    amount: number;
    description: string[];
    foodName: string;
    unit: string;
  };
}

export class CreateMealReportReviewDTO {
  appUserId: string;
  audioId: string;
  dbLookupPreference: DBLookupPreference;
  foodReports: FoodReportReviewCreateDTO[];
  mealRecordedAt: Date;
  rawTranscript: string;
}

export class MRRQueryParamsDTO {
  fetchFoodReports?: boolean;
}

export class MRRQueryParamsPaginationDTO {
  pending?: boolean;
  fetchFoodReports?: boolean;
  limit?: number;
  mealRecordedEnd?: string;
  mealRecordedStart?: string;
}

export class MealReportReviewUpdateDTO {
  pending: boolean;
}

export class MRRNutritionQueryParamsDTO {
  mealRecordedEnd: string;
  mealRecordedStart: string;
}
