import { NestedPick } from "@common/types/common-types";
import { FoodReportReview } from "../entities/food-report-review";
import { FoodReportReviewSearchInput } from "../schema-types";

export type FoodReportReviewManySearchInput = NestedPick<
  FoodReportReviewSearchInput,
  "searchBy",
  "mealReviewReportId"
>;

export interface IFoodReportReviewUseCase {
  getOneBy(
    input: FoodReportReviewSearchInput
  ): Promise<FoodReportReview | undefined>;
  getOneBy(
    input: FoodReportReviewSearchInput,
    transactionManager?: any
  ): Promise<FoodReportReview | undefined>;
  delete(input: FoodReportReviewSearchInput): Promise<void>;
  delete(
    input: FoodReportReviewSearchInput,
    transactionManager?: any
  ): Promise<void>;
  getManyBy(
    input: FoodReportReviewManySearchInput
  ): Promise<FoodReportReview[]>;
}
