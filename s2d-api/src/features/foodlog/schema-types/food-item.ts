/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface FoodItemSearchInput {
  searchBy: {
    foodReportReviewId: string;
    id: string;
    mealReportReviewId: string;
  };
}

export interface FoodItemUpdateInput {
  data: {
    amount: number;
  };
  searchBy: {
    foodReportReviewId: string;
    mealReportReviewId: string;
  };
}
