import { AuthUser } from "@features/auth/entities/auth-user";
import { GetAuthUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { AuthUserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import {
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
} from "@nestjs/common";

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

  @UseGuards(AuthUserGuard)
  @Get()
  getMealReportReviews(
    @GetAuthUser() user: AuthUser,
    @Query() query: QueryParamsWithPagination
  ) {
    // TODO: Implement user id filter
    return this.mealReportReviewUseCase.getManyBy({
      options: {
        fetchFoodReports: query?.fetchFoodReports,
      },
      pagination: {
        limit: query?.limit,
      },
      searchBy: {
        id: query?.id,
        pending: query?.pending,
      },
    });
  }

  @UseGuards(AuthUserGuard)
  @Get(":id")
  getMealReportReview(
    @GetAuthUser() user: AuthUser,
    @Query() query: QueryParams,
    @Param("id") id: string
  ) {
    // TODO: Implement user id filter
    return this.mealReportReviewUseCase.getOneBy({
      options: {
        fetchFoodReports: query?.fetchFoodReports,
      },
      searchBy: {
        id,
      },
    });
  }

  @UseGuards(AuthUserGuard)
  @Patch(":id")
  updateMealReportReview(
    @GetAuthUser() user: AuthUser,
    @Body() requestData: UpdateMealReportReviewRequest,
    @Param("id") id: string
  ) {
    // TODO: Implement user id filter
    return this.mealReportReviewUseCase.update({
      searchBy: {
        id,
      },
      data: {
        ...requestData,
      },
    });
  }

  @UseGuards(AuthUserGuard)
  @Delete(":id")
  deleteMealReportReview(
    @GetAuthUser() user: AuthUser,
    @Query() query: QueryParams,
    @Param("id") id: string
  ) {
    // TODO: Implement user id filter
    return this.mealReportReviewUseCase.delete({
      searchBy: {
        id,
      },
    });
  }
}
