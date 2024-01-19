import Joi from "joi";
import { validateDataWithJoi } from "@common/validations";
import {
  MealReportReview,
  MealReportReviewCreateInputSchema,
} from "../entities/meal-report-review";

import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { MealReportReviewCreateInput } from "../schema-types";

export class MealReportReviewUseCase implements IMealReportReviewUseCase {
  create(input: MealReportReviewCreateInput): Promise<MealReportReview> {
    this.validateInput(MealReportReviewCreateInputSchema, input);

    throw new Error("Method not implemented.");
  }

  private validateInput<T = any>(schema: Joi.ObjectSchema<T>, input: any) {
    const value = validateDataWithJoi(schema, input);
    return value;
  }
}
