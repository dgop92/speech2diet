import Joi from "joi";
import { AppLogger } from "@common/logging/logger";
import { validateDataWithJoi } from "@common/validations";
import {
  FoodReportReview,
  FoodReportReviewSearchInputSchema,
} from "../entities/food-report-review";
import { IFoodReportReviewRepository } from "../ports/food-report-review.repository.definition";
import {
  FoodReportReviewManySearchInput,
  IFoodReportReviewUseCase,
} from "../ports/food-report-review.use-case.definition";
import { FoodReportReviewSearchInput } from "../schema-types";
import { IMealReportReviewUseCase } from "../ports/meal-report-review.use-case.definition";
import { ApplicationError, ErrorCode } from "@common/errors";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

const FoodReportReviewManySearchInputSchema = Joi.object({
  searchBy: Joi.object({
    mealReviewReportId: Joi.string().required(),
  }),
});

export class FoodReportReviewUseCase implements IFoodReportReviewUseCase {
  private mealReportReviewUseCase: IMealReportReviewUseCase;

  constructor(private readonly repository: IFoodReportReviewRepository) {}

  setDependencies(mealReportReviewUseCase: IMealReportReviewUseCase) {
    this.mealReportReviewUseCase = mealReportReviewUseCase;
  }

  delete(input: FoodReportReviewSearchInput): Promise<void>;
  delete(
    input: FoodReportReviewSearchInput,
    transactionManager: any
  ): Promise<void>;
  async delete(
    input: FoodReportReviewSearchInput,
    transactionManager?: any
  ): Promise<void> {
    this.validateInput(FoodReportReviewSearchInputSchema, input);
    myLogger.debug("getting meal report review", {
      mmrId: input.searchBy.mealReviewReportId,
    });
    const mealReportReview = await this.mealReportReviewUseCase.getOneBy({
      searchBy: {
        id: input.searchBy.mealReviewReportId,
      },
      options: {
        fetchFoodReports: true,
      },
    });

    if (!mealReportReview) {
      throw new ApplicationError(
        "mealReportReview not found",
        ErrorCode.NOT_FOUND
      );
    }

    myLogger.debug("getting food report review", {
      frrId: input.searchBy.id,
    });
    const foodReportReview = mealReportReview.foodReports!.find(
      (foodReport) => foodReport.id === input.searchBy.id
    );

    if (!foodReportReview) {
      throw new ApplicationError(
        "foodReportReview not found",
        ErrorCode.NOT_FOUND
      );
    }

    await this.repository.removeFoodReportReview(
      foodReportReview,
      mealReportReview,
      transactionManager
    );
  }

  getOneBy(
    input: FoodReportReviewSearchInput
  ): Promise<FoodReportReview | undefined>;
  getOneBy(
    input: FoodReportReviewSearchInput,
    transactionManager: any
  ): Promise<FoodReportReview | undefined>;
  async getOneBy(
    input: FoodReportReviewSearchInput,
    transactionManager?: any
  ): Promise<FoodReportReview | undefined> {
    this.validateInput(FoodReportReviewSearchInputSchema, input);
    myLogger.debug("getting meal report review", {
      mmrId: input.searchBy.mealReviewReportId,
    });
    const mealReportReview = await this.mealReportReviewUseCase.getOneBy(
      {
        searchBy: {
          id: input.searchBy.mealReviewReportId,
        },
        options: {
          fetchFoodReports: true,
        },
      },
      transactionManager
    );

    if (!mealReportReview) {
      throw new ApplicationError(
        "mealReportReview not found",
        ErrorCode.NOT_FOUND
      );
    }

    myLogger.debug("getting food report review", {
      frrId: input.searchBy.id,
    });
    const foodReportReview = mealReportReview.foodReports!.find(
      (foodReport) => foodReport.id === input.searchBy.id
    );

    return foodReportReview;
  }

  async getManyBy(
    input: FoodReportReviewManySearchInput
  ): Promise<FoodReportReview[]> {
    this.validateInput(FoodReportReviewManySearchInputSchema, input);

    myLogger.debug("getting meal report review", {
      mmrId: input.searchBy.mealReviewReportId,
    });
    const mealReportReview = await this.mealReportReviewUseCase.getOneBy({
      searchBy: {
        id: input.searchBy.mealReviewReportId,
      },
      options: {
        fetchFoodReports: true,
      },
    });

    if (!mealReportReview) {
      throw new ApplicationError(
        "mealReportReview not found",
        ErrorCode.NOT_FOUND
      );
    }

    return mealReportReview.foodReports!;
  }

  private validateInput(schema: Joi.ObjectSchema, input: any): void {
    validateDataWithJoi(schema, input);
  }
}
