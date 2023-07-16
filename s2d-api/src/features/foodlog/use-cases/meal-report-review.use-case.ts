import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import {
  MealReportReview,
  MealReportReviewSearchInputSchema,
  MealReportReviewUpdateInputSchema,
} from "../entities/meal-report-review";
import { IMealReportReviewRepository } from "../ports/meal-report-review.repository.definition";
import {
  IMealReportReviewUseCase,
  MealReportReviewLookUpField,
} from "../ports/meal-report-review.use-case.definition";
import {
  MealReportReviewSearchInput,
  MealReportReviewUpdateInput,
} from "../schema-types";
import { ApplicationError, ErrorCode } from "@common/errors";
import { SearchByUidSchema } from "@common/schemas/idValidations";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class MealReportReviewUseCase implements IMealReportReviewUseCase {
  constructor(private readonly repository: IMealReportReviewRepository) {}

  update(input: MealReportReviewUpdateInput): Promise<MealReportReview>;
  update(
    input: MealReportReviewUpdateInput,
    transactionManager: any
  ): Promise<MealReportReview>;
  async update(
    input: MealReportReviewUpdateInput,
    transactionManager?: any
  ): Promise<MealReportReview> {
    this.validateInput(MealReportReviewUpdateInputSchema, input);
    myLogger.debug("getting mealReportReview by", { id: input.searchBy.id });
    const mealReportReview = await this.repository.getOneBy(
      {
        searchBy: { id: input.searchBy.id },
      },
      transactionManager
    );

    if (!mealReportReview) {
      throw new ApplicationError(
        "mealReportReview not found",
        ErrorCode.NOT_FOUND
      );
    }
    myLogger.debug("mealReportReview found", { id: input.searchBy.id });

    return this.repository.update(
      mealReportReview,
      input.data,
      transactionManager
    );
  }

  delete(input: MealReportReviewLookUpField): Promise<void>;
  delete(
    input: MealReportReviewLookUpField,
    transactionManager: any
  ): Promise<void>;
  async delete(
    input: MealReportReviewLookUpField,
    transactionManager?: any
  ): Promise<void> {
    this.validateInput(SearchByUidSchema, input);
    myLogger.debug("getting mealReportReview by", { id: input.searchBy.id });
    const mealReportReview = await this.repository.getOneBy(
      {
        searchBy: { id: input.searchBy.id },
      },
      transactionManager
    );

    if (!mealReportReview) {
      throw new ApplicationError(
        "mealReportReview not found",
        ErrorCode.NOT_FOUND
      );
    }
    myLogger.debug("mealReportReview found", { id: input.searchBy.id });

    return this.repository.delete(mealReportReview, transactionManager);
  }

  getOneBy(
    input: MealReportReviewSearchInput
  ): Promise<MealReportReview | undefined>;
  getOneBy(
    input: MealReportReviewSearchInput,
    transactionManager: any
  ): Promise<MealReportReview | undefined>;
  getOneBy(
    input: MealReportReviewSearchInput,
    transactionManager?: any
  ): Promise<MealReportReview | undefined> {
    this.validateInput(MealReportReviewSearchInputSchema, input);
    return this.repository.getOneBy(input, transactionManager);
  }

  getManyBy(input: MealReportReviewSearchInput): Promise<MealReportReview[]> {
    this.validateInput(MealReportReviewSearchInputSchema, input);
    return this.repository.getManyBy(input);
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
