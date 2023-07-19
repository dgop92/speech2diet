/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

import { FoodCreateInput } from ".";

export interface FoodItemCreateInput {
  amount: number;
  food: FoodCreateInput;
  score: number;
  unitWasTransformed: boolean;
}

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
