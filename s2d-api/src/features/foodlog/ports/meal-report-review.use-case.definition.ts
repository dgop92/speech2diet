import { AppUser } from "@features/auth/entities/app-user";
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
  update(
    input: MealReportReviewUpdateInput,
    appUser: AppUser
  ): Promise<MealReportReview>;
  update(
    input: MealReportReviewUpdateInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<MealReportReview>;
  getOneBy(
    input: MealReportReviewSearchInput,
    appUser: AppUser
  ): Promise<MealReportReview | undefined>;
  getOneBy(
    input: MealReportReviewSearchInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<MealReportReview | undefined>;
  delete(input: MealReportReviewLookUpField, appUser: AppUser): Promise<void>;
  delete(
    input: MealReportReviewLookUpField,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<void>;
  getManyBy(
    input: MealReportReviewSearchInput,
    appUser: AppUser
  ): Promise<MealReportReview[]>;
}
