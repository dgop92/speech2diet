import { FoodReportReview } from "./food-report-review";
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

export const MealReportReviewPaginationSchema = Joi.object({
  limit: Joi.number()
    .positive()
    .max(50)
    .optional()
    .description("Limit results per request"),
}).meta({
  className: "MealReportReviewPagination",
});

export const MealReportReviewOptionsSchema = Joi.object({
  fetchFoodReports: Joi.boolean().optional(),
}).meta({ className: "MealReportReviewOptions" });

export const MealReportReviewUpdateInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().required(),
  }).required(),
  data: Joi.object({
    pending: Joi.boolean().required(),
  }).required(),
}).meta({ className: "MealReportReviewUpdateInput" });

export const MealReportReviewSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().optional(),
    pending: Joi.boolean().optional(),
    appUserId: Joi.string().optional(),
  }).optional(),
  sortBy: Joi.object({
    createdAt: Joi.string().valid("asc", "desc").optional(),
  }).optional(),
  pagination: MealReportReviewPaginationSchema,
  options: MealReportReviewOptionsSchema,
}).meta({ className: "MealReportReviewSearchInput" });
