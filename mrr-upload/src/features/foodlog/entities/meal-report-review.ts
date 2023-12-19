import {
  FoodReportReview,
  FoodReportReviewCreateInputSchema,
} from "./food-report-review";
import Joi from "joi";

export enum DBLookupPreference {
  USER_DB_SYSTEM_DB = "user_db-system_db",
  SYSTEM_DB_USER_DB = "system_db-user_db",
  USER_DB = "user-db",
  SYSTEM_DB = "system-db",
}

export interface MealReportReview {
  id: string;
  appUserId: string;
  audioId: string;
  rawTranscript: string;
  foodReports?: FoodReportReview[];
  dbLookupPreference: DBLookupPreference;
  mealRecordedAt: Date;
  pending: boolean;
}

export const MealReportReviewCreateInputSchema = Joi.object({
  data: Joi.object({
    appUserId: Joi.string().required(),
    audioId: Joi.string().required(),
    rawTranscript: Joi.string().required(),
    foodReports: Joi.array()
      .items(FoodReportReviewCreateInputSchema)
      .required(),
    dbLookupPreference: Joi.string()
      .valid(
        DBLookupPreference.USER_DB_SYSTEM_DB,
        DBLookupPreference.SYSTEM_DB_USER_DB,
        DBLookupPreference.USER_DB,
        DBLookupPreference.SYSTEM_DB
      )
      .required(),
    mealRecordedAt: Joi.date().required(),
  }).required(),
}).meta({ className: "MealReportReviewCreateInput" });
