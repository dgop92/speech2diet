import {
  MealReportReviewCreateInput,
  FoodItemCreateInput,
  UnitTransformationInfo,
} from "@features/foodlog/schema-types";
import {
  FoodRecord,
  NutritionInformationResponse,
} from "./entities/nutrition-information-response";

export function fromNutritionInformationResponseToMealReportReviewCreateInput(
  nir: NutritionInformationResponse
): MealReportReviewCreateInput {
  // basic metadata
  const appUserId = nir.ni_request.user_id;
  const audioId = nir.ni_request.audio_id;
  const dbLookupPreference = nir.ni_request.db_lookup_preference;
  const mealRecordedAt = nir.ni_request.meal_recorded_at;
  const rawTranscript = nir.raw_transcript;

  const foodReports = nir.food_responses.map((frr, index) => {
    // food reponses has a 1:1 mapping with food requests
    const foodRequest = nir.food_requests[index];
    const userReport = {
      amount: foodRequest.amount,
      description: foodRequest.description,
      foodName: foodRequest.food_name,
      unit: foodRequest.unit,
    };
    const systemResult = {
      foundFoodItem: frr.food_record
        ? fromFoodRecordToFoodItemCreateInput(frr.food_record)
        : null,
      suggestions: frr.suggestions.map(fromFoodRecordToFoodItemCreateInput),
    };
    return { systemResult, userReport };
  });
  return {
    data: {
      appUserId,
      audioId,
      dbLookupPreference,
      foodReports,
      mealRecordedAt: new Date(mealRecordedAt),
      rawTranscript,
    },
  };
}

function fromFoodRecordToFoodItemCreateInput(
  fr: FoodRecord
): FoodItemCreateInput {
  let uti: UnitTransformationInfo | null = null;
  if (fr.unit_transformation_info !== null) {
    uti = {
      originalUnit: fr.unit_transformation_info.original_unit,
      finalUnit: fr.unit_transformation_info.final_unit,
      transformationFactor: fr.unit_transformation_info.transformation_factor,
    };
  }

  return {
    amount: fr.amount,
    food: {
      id: fr.food.id,
      foodName: fr.food.food_name,
      otherNames: fr.food.other_names,
      description: fr.food.description,
      portionSize: fr.food.portion_size,
      portionSizeUnit: fr.food.portion_size_unit,
      servingSize: fr.food.serving_size,
      servingSizeUnit: fr.food.serving_size_unit,
      foodSource: fr.food.food_source,
      calories: fr.food.calories,
      protein: fr.food.protein,
      fat: fr.food.fat,
      carbohydrates: fr.food.carbohydrates,
    },
    score: fr.score,
    unitWasTransformed: fr.unit_was_transformed,
    servingSizeWasUsed: fr.serving_size_was_used,
    unitTransformationInfo: uti,
  };
}
