import { MealReportReview } from "../entities/meal-report-review";
import { MealReportReviewCreateInput } from "../schema-types";

export type MealReportReviewLookUpField = {
  searchBy: {
    id: string;
  };
};

export interface IMealReportReviewUseCase {
  create(input: MealReportReviewCreateInput): Promise<MealReportReview>;
}
