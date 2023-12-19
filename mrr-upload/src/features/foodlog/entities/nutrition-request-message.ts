import { DBLookupPreference } from "./meal-report-review";

export interface NutritionRequestMessage {
  appUserId: string;
  audioId: string;
  dbLookupPreference: DBLookupPreference;
  mealRecordedAt: Date;
}
