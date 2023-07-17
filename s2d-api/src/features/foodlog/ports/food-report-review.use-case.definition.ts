import { FoodReportReview } from "../entities/food-report-review";
import { FoodReportReviewSearchInput } from "../schema-types";

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
  getManyBy(input: FoodReportReviewSearchInput): Promise<FoodReportReview[]>;
  getManyBy(
    input: FoodReportReviewSearchInput,
    transactionManager?: any
  ): Promise<FoodReportReview[]>;
}
