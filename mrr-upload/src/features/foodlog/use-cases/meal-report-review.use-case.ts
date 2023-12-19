import Joi from "joi";
import { validateDataWithJoi } from "@common/validations";
import {
  MealReportReview,
  MealReportReviewCreateInputSchema,
} from "../entities/meal-report-review";
import { IMealReportReviewRepository } from "../ports/meal-report-review.repository.definition";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { MealReportReviewCreateInput } from "../schema-types";

export class MealReportReviewUseCase implements IMealReportReviewUseCase {
  constructor(private readonly repository: IMealReportReviewRepository) {}

  create(input: MealReportReviewCreateInput): Promise<MealReportReview> {
    this.validateInput(MealReportReviewCreateInputSchema, input);

    return this.repository.create(input.data);
  }

  private validateInput<T = any>(schema: Joi.ObjectSchema<T>, input: any) {
    const value = validateDataWithJoi(schema, input);
    return value;
  }
}
