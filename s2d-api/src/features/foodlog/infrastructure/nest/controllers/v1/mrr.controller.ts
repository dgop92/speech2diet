import { ErrorCode, PresentationError } from "@common/errors";
import { User } from "@features/auth/entities/user";
import { GetUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { UserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import {
  MealReportReviewCreateInput,
  MealReportReviewSearchInput,
  MealReportReviewUpdateInput,
} from "@features/foodlog/schema-types";
import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Delete,
  Patch,
  Body,
  HttpCode,
  Post,
} from "@nestjs/common";
import { SimpleApiKeyGuard } from "../../guards/simple-apikey.guard";

type CreateMealReportReviewRequest = MealReportReviewCreateInput["data"];

type QueryParams = MealReportReviewSearchInput["searchBy"] &
  MealReportReviewSearchInput["options"];

type QueryParamsWithPagination = QueryParams &
  MealReportReviewSearchInput["pagination"];

type UpdateMealReportReviewRequest = MealReportReviewUpdateInput["data"];

@Controller({
  path: "mrr",
  version: "1",
})
export class MealReportReviewControllerV1 {
  private readonly mealReportReviewUseCase: IMealReportReviewUseCase;
  constructor() {
    const { mealReportReviewUseCase } = myMealReportReviewFactory();
    this.mealReportReviewUseCase = mealReportReviewUseCase;
  }

  @UseGuards(SimpleApiKeyGuard)
  @Post()
  createMealReportReview(@Body() requestData: CreateMealReportReviewRequest) {
    return this.mealReportReviewUseCase.create({
      data: requestData,
    });
  }

  @UseGuards(UserGuard)
  @Get()
  getMealReportReviews(
    @GetUser() user: User,
    @Query() query: QueryParamsWithPagination
  ) {
    // TODO: Implement sort by date option
    return this.mealReportReviewUseCase.getManyBy(
      {
        options: {
          fetchFoodReports: query?.fetchFoodReports,
        },
        pagination: {
          limit: query?.limit,
        },
        searchBy: {
          pending: query?.pending,
        },
      },
      user.appUser
    );
  }

  @UseGuards(UserGuard)
  @Get(":id")
  async getMealReportReview(
    @GetUser() user: User,
    @Query() query: QueryParams,
    @Param("id") id: string
  ) {
    // TODO: Implement user id filter
    const mrr = await this.mealReportReviewUseCase.getOneBy(
      {
        options: {
          fetchFoodReports: query?.fetchFoodReports,
        },
        searchBy: {
          id,
        },
      },
      user.appUser
    );

    if (!mrr) {
      throw new PresentationError(
        "Meal report review not found",
        ErrorCode.NOT_FOUND
      );
    }

    return mrr;
  }

  @UseGuards(UserGuard)
  @Patch(":id")
  updateMealReportReview(
    @GetUser() user: User,
    @Body() requestData: UpdateMealReportReviewRequest,
    @Param("id") id: string
  ) {
    // TODO: Implement user id filter
    return this.mealReportReviewUseCase.update(
      {
        searchBy: {
          id,
        },
        data: {
          ...requestData,
        },
      },
      user.appUser
    );
  }

  @UseGuards(UserGuard)
  @HttpCode(204)
  @Delete(":id")
  deleteMealReportReview(@GetUser() user: User, @Param("id") id: string) {
    // TODO: Implement user id filter
    return this.mealReportReviewUseCase.delete(
      {
        searchBy: {
          id,
        },
      },
      user.appUser
    );
  }
}
