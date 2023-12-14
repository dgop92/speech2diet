import { NestedPick } from "@common/types/common-types";
import { FoodReportReview } from "../entities/food-report-review";
import { FoodReportReviewSearchInput } from "../schema-types";
import { AppUser } from "@features/auth/entities/app-user";

export type FoodReportReviewManySearchInput = NestedPick<
  FoodReportReviewSearchInput,
  "searchBy",
  "mealReviewReportId"
>;

export interface IFoodReportReviewUseCase {
  getOneBy(
    input: FoodReportReviewSearchInput,
    appUser: AppUser
  ): Promise<FoodReportReview | undefined>;
  getOneBy(
    input: FoodReportReviewSearchInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<FoodReportReview | undefined>;
  delete(input: FoodReportReviewSearchInput, appUser: AppUser): Promise<void>;
  delete(
    input: FoodReportReviewSearchInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<void>;
  getManyBy(
    input: FoodReportReviewManySearchInput,
    appUser: AppUser
  ): Promise<FoodReportReview[]>;
}
