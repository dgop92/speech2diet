import {
  DBLookupPreference,
  MealReportReview,
} from "@features/foodlog/entities/meal-report-review";
import { FoodReportReview } from "@features/foodlog/entities/food-report-review";
import { FirestoreMealReportReview } from "./entities/meal-report-review.firestore";
import {
  FoodCreateInput,
  FoodItemCreateInput,
  FoodReportReviewCreateInput,
} from "@features/foodlog/schema-types";
import { FoodItem } from "@features/foodlog/entities/food-item";
import { Food, FoodSource } from "@features/foodlog/entities/food";

import { v4 as uuidv4 } from "uuid";
import { MealReportReviewCreateRepoData } from "@features/foodlog/ports/meal-report-review.repository.definition";
import { Timestamp } from "firebase-admin/firestore";

export function firestoreMealReportReviewToDomain(
  firestoreMealReportReview: FirestoreMealReportReview
): MealReportReview {
  const { mealRecordedAt, ...rest } = firestoreMealReportReview;
  return {
    ...rest,
    mealRecordedAt: mealRecordedAt.toDate(),
  };
}

export function mealReportReviewDataToFirestoreMealReportReview(
  mealReportReviewInput: MealReportReviewCreateRepoData
): FirestoreMealReportReview {
  const {
    foodReports: foodReportsInput,
    mealRecordedAt,
    dbLookupPreference,
    ...rest
  } = mealReportReviewInput;

  const foodReports = foodReportsInput.map(
    foodReportReviewInputToFoodReportReview
  );

  return {
    ...rest,
    foodReports,
    pending: true,
    mealRecordedAt: Timestamp.fromDate(mealRecordedAt),
    dbLookupPreference: dbLookupPreference as DBLookupPreference,
    id: uuidv4(),
  };
}

export function foodReportReviewInputToFoodReportReview(
  foodReportReviewInput: FoodReportReviewCreateInput
): FoodReportReview {
  const systemResultInput = foodReportReviewInput.systemResult;
  const userReport = foodReportReviewInput.userReport;

  const { foundFoodItem: foundFoodItemInput, suggestions: suggestionsInput } =
    systemResultInput;

  const foundFoodItem =
    foundFoodItemInput && foodItemInputToFoodItem(foundFoodItemInput);
  const suggestions = suggestionsInput.map(foodItemInputToFoodItem);

  const systemResult = {
    foundFoodItem,
    suggestions,
  };

  return {
    systemResult,
    userReport,
    id: uuidv4(),
  };
}

export function foodItemInputToFoodItem(
  foodItemInput: FoodItemCreateInput
): FoodItem {
  const { food: foodInput, ...rest } = foodItemInput;
  return {
    ...rest,
    food: foodInputToFood(foodInput),
    amountByUser: false,
    id: uuidv4(),
  };
}

export function foodInputToFood(foodItemInput: FoodCreateInput): Food {
  const { foodSource, ...rest } = foodItemInput;
  return {
    ...rest,
    foodSource: foodSource as FoodSource,
  };
}
