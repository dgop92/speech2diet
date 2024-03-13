import { FoodSource } from "@features/foodlog/entities/food";
import { DBLookupPreference } from "@features/foodlog/entities/meal-report-review";
import {
  FoodCreateInput,
  FoodItemCreateInput,
  FoodReportReviewCreateInput,
  MealReportReviewCreateInput,
} from "@features/foodlog/schema-types";
import { v4 as uuidv4 } from "uuid";

export function createInputTestFood(): FoodCreateInput {
  return {
    id: uuidv4(),
    foodName: "Crunchy Delight",
    otherNames: ["Crispy Joy", "Snacktastic"],
    description: ["Cooked", "crunchy", "flavorful"],
    portionSize: 50,
    portionSizeUnit: "grams",
    servingSize: 90,
    servingSizeUnit: "grams",
    foodSource: FoodSource.SYSTEM_DB,
    calories: 200,
    protein: 4,
    fat: 10,
    carbohydrates: 25,
  };
}

export function createInputTestFoodItem(): FoodItemCreateInput {
  return {
    amount: 64,
    food: createInputTestFood(),
    score: 0.9,
    unitWasTransformed: false,
  };
}

export function createInputTestFoodReport(data: {
  foundFoodItem: FoodItemCreateInput | null;
  suggestions: FoodItemCreateInput[];
}): FoodReportReviewCreateInput {
  return {
    systemResult: {
      foundFoodItem: data.foundFoodItem,
      suggestions: data.suggestions,
    },
    userReport: {
      amount: 64,
      description: ["Cooked", "crunchy", "flavorful"],
      foodName: "Crunchy Delight",
      unit: "g",
    },
  };
}

export function createInputMealReportReview(data: {
  foodReports: FoodReportReviewCreateInput[];
  mealRecordedAt?: Date;
  appUserId?: string;
  audioId?: string;
}): MealReportReviewCreateInput {
  return {
    data: {
      appUserId: data.appUserId ?? uuidv4(),
      audioId: data.audioId ?? uuidv4(),
      dbLookupPreference: DBLookupPreference.SYSTEM_DB,
      foodReports: data.foodReports,
      mealRecordedAt: data.mealRecordedAt ?? new Date(),
      rawTranscript: "I ate a crunchy delight",
    },
  };
}
