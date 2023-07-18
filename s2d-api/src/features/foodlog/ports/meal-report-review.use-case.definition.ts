import { MealReportReview } from "../entities/meal-report-review";
import {
  MealReportReviewUpdateInput,
  MealReportReviewSearchInput,
  MealReportReviewCreateInput,
} from "../schema-types";

export type MealReportReviewLookUpField = {
  searchBy: {
    id: string;
  };
};

export interface IMealReportReviewUseCase {
  create(input: MealReportReviewCreateInput): Promise<MealReportReview>;
  create(
    input: MealReportReviewCreateInput,
    transactionManager?: any
  ): Promise<MealReportReview>;
  update(input: MealReportReviewUpdateInput): Promise<MealReportReview>;
  update(
    input: MealReportReviewUpdateInput,
    transactionManager?: any
  ): Promise<MealReportReview>;
  getOneBy(
    input: MealReportReviewSearchInput
  ): Promise<MealReportReview | undefined>;
  getOneBy(
    input: MealReportReviewSearchInput,
    transactionManager?: any
  ): Promise<MealReportReview | undefined>;
  delete(input: MealReportReviewLookUpField): Promise<void>;
  delete(
    input: MealReportReviewLookUpField,
    transactionManager?: any
  ): Promise<void>;
  getManyBy(input: MealReportReviewSearchInput): Promise<MealReportReview[]>;
}
