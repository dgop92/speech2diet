import { MealReportReview } from "../entities/meal-report-review";
import { MealReportReviewCreateInput } from "../schema-types";

export type MealReportReviewCreateRepoData =
  MealReportReviewCreateInput["data"];

export interface IMealReportReviewRepository {
  create(input: MealReportReviewCreateRepoData): Promise<MealReportReview>;
}
