import { ErrorCode, PresentationError } from "@common/errors";
import { User } from "@features/auth/entities/user";
import { GetUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { UserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
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
import {
  CreateMealReportReviewDTO,
  MRRQueryParamsDTO,
  MRRQueryParamsPaginationDTO,
  MealReportReviewUpdateDTO,
} from "./controller-dtos/mrr.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CommonErrorResponse } from "@common/nest/api-error.dto";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";

@ApiTags("mrr")
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
  @ApiHeader({
    name: "X-API-KEY",
    description: "the api key required to save the meal report review",
  })
  @ApiCreatedResponse({ type: MealReportReview })
  @ApiBadRequestResponse({
    type: CommonErrorResponse,
  })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiOperation({
    summary:
      "Create a meal report review. This endpoint is not intended to be used by the mobile app, but by an internal service.",
  })
  createMealReportReview(@Body() requestData: CreateMealReportReviewDTO) {
    return this.mealReportReviewUseCase.create({
      data: requestData,
    });
  }

  @UseGuards(UserGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: MealReportReview, isArray: true })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiOperation({
    summary: "Get all meal report reviews from the authenticated user",
  })
  getMealReportReviews(
    @GetUser() user: User,
    @Query() query: MRRQueryParamsPaginationDTO
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
  @ApiBearerAuth()
  @ApiOkResponse({ type: MealReportReview })
  @ApiNotFoundResponse({ type: CommonErrorResponse })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiOperation({
    summary: "Get a meal report review by id",
  })
  async getMealReportReview(
    @GetUser() user: User,
    @Query() query: MRRQueryParamsDTO,
    @Param("id") id: string
  ) {
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
  @ApiBearerAuth()
  @ApiOkResponse({ type: MealReportReview })
  @ApiBadRequestResponse({ type: CommonErrorResponse })
  @ApiNotFoundResponse({ type: CommonErrorResponse })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiOperation({
    summary: "Update a meal report review by id",
  })
  updateMealReportReview(
    @GetUser() user: User,
    @Body() requestData: MealReportReviewUpdateDTO,
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
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: CommonErrorResponse })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiOperation({
    summary: "Delete a meal report review by id",
  })
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
