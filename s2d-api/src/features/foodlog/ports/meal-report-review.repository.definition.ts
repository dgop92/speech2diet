import { MealReportReview } from "../entities/meal-report-review";
import {
  MealReportReviewUpdateInput,
  MealReportReviewSearchInput,
} from "../schema-types";

export type MealReportReviewUpdateRepoData =
  MealReportReviewUpdateInput["data"];

export interface IMealReportReviewRepository {
  update(input: MealReportReviewUpdateInput): Promise<MealReportReview>;
  update<T>(
    input: MealReportReviewUpdateInput,
    transactionManager?: T
  ): Promise<MealReportReview>;
  getOneBy(
    input: MealReportReviewSearchInput
  ): Promise<MealReportReview | undefined>;
  getOneBy<T>(
    input: MealReportReviewSearchInput,
    transactionManager?: T
  ): Promise<MealReportReview | undefined>;
  delete(mealReportReview: MealReportReview): Promise<void>;
  delete<T>(
    mealReportReview: MealReportReview,
    transactionManager?: T
  ): Promise<void>;
  getManyBy(input: MealReportReviewSearchInput): Promise<MealReportReview[]>;
  getManyBy<T>(
    input: MealReportReviewSearchInput,
    transactionManager?: T
  ): Promise<MealReportReview[]>;
}
