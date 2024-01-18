import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import {
  MealReportReview,
  MealReportReviewCreateInputSchema,
  MealReportReviewSearchInputSchema,
  MealReportReviewUpdateInputSchema,
} from "../entities/meal-report-review";
import { IMealReportReviewRepository } from "../ports/meal-report-review.repository.definition";
import {
  IMealReportReviewUseCase,
  MealReportReviewLookUpField,
} from "../ports/meal-report-review.use-case.definition";
import {
  MealReportReviewCreateInput,
  MealReportReviewSearchInput,
  MealReportReviewUpdateInput,
} from "../schema-types";
import { ApplicationError, ErrorCode } from "@common/errors";
import { SearchByUidSchema } from "@common/schemas/idValidations";
import { AppUser } from "@features/auth/entities/app-user";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class MealReportReviewUseCase implements IMealReportReviewUseCase {
  constructor(private readonly repository: IMealReportReviewRepository) {}

  create(input: MealReportReviewCreateInput): Promise<MealReportReview>;
  create(
    input: MealReportReviewCreateInput,
    transactionManager?: any
  ): Promise<MealReportReview>;
  create(
    input: MealReportReviewCreateInput,
    transactionManager?: any
  ): Promise<MealReportReview> {
    this.validateInput(MealReportReviewCreateInputSchema, input);

    return this.repository.create(input.data, transactionManager);
  }

  update(
    input: MealReportReviewUpdateInput,
    appUser: AppUser
  ): Promise<MealReportReview>;
  update(
    input: MealReportReviewUpdateInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<MealReportReview>;
  async update(
    input: MealReportReviewUpdateInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<MealReportReview> {
    this.validateInput(MealReportReviewUpdateInputSchema, input);
    myLogger.debug("getting mealReportReview by", { id: input.searchBy.id });
    const mealReportReview = await this.repository.getOneBy(
      {
        searchBy: { id: input.searchBy.id, appUserId: appUser.id },
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

  delete(input: MealReportReviewLookUpField, appUser: AppUser): Promise<void>;
  delete(
    input: MealReportReviewLookUpField,
    appUser: AppUser,
    transactionManager: any
  ): Promise<void>;
  async delete(
    input: MealReportReviewLookUpField,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<void> {
    this.validateInput(SearchByUidSchema, input);
    myLogger.debug("getting mealReportReview by", { id: input.searchBy.id });
    const mealReportReview = await this.repository.getOneBy(
      {
        searchBy: { id: input.searchBy.id, appUserId: appUser.id },
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
    input: MealReportReviewSearchInput,
    appUser: AppUser
  ): Promise<MealReportReview | undefined>;
  getOneBy(
    input: MealReportReviewSearchInput,
    appUser: AppUser,
    transactionManager: any
  ): Promise<MealReportReview | undefined>;
  getOneBy(
    input: MealReportReviewSearchInput,
    appUser: AppUser,
    transactionManager?: any
  ): Promise<MealReportReview | undefined> {
    const newInput = this.validateInput<MealReportReviewSearchInput>(
      MealReportReviewSearchInputSchema,
      input
    );
    return this.repository.getOneBy(
      {
        ...newInput,
        searchBy: { ...newInput.searchBy, appUserId: appUser.id },
      },
      transactionManager
    );
  }

  getManyBy(
    input: MealReportReviewSearchInput,
    appUser: AppUser
  ): Promise<MealReportReview[]> {
    const newInput = this.validateInput<MealReportReviewSearchInput>(
      MealReportReviewSearchInputSchema,
      input
    );
    return this.repository.getManyBy({
      ...newInput,
      searchBy: { ...newInput.searchBy, appUserId: appUser.id },
    });
  }

  private validateInput<T = any>(schema: Joi.ObjectSchema<T>, input: any) {
    const value = validateDataWithJoi(schema, input);
    return value;
  }
}
