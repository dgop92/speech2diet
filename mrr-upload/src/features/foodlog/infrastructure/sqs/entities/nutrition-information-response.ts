enum FoodSource {
  user_db = "user_db",
  system_db = "system_db",
}

interface Food {
  id: string;
  food_name: string;
  other_names: string[];
  description: string[];
  full_description: string[];
  portion_reference: number;
  portion_unit: string;
  food_source: FoodSource;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface FoodRecord {
  food: Food;
  score: number;
  amount: number;
  unit_was_transformed: boolean;
}

export interface FoodNutritionResponse {
  food_record: FoodRecord | null;
  suggestions: FoodRecord[];
  user_amount: number;
  user_unit: string;
}

interface FoodNutritionRequest {
  food_name: string;
  description: string[];
  amount: number;
  unit: string;
}

enum DBLookupPreference {
  user_db_system_db = "user_db-system_db",
  system_db_user_db = "system_db-user_db",
  user_db = "user-db",
  system_db = "system-db",
}

interface NutritionInformationRequest {
  user_id: string;
  audio_id: string;
  db_lookup_preference: DBLookupPreference;
  meal_recorded_at: string;
}

export interface NutritionInformationResponse {
  raw_transcript: string;
  food_responses: FoodNutritionResponse[];
  food_requests: FoodNutritionRequest[];
  ni_request: NutritionInformationRequest;
}
