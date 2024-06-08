import { ErrorCode, PresentationError } from "@common/errors";
import { User } from "@features/auth/entities/user";
import { GetUser } from "@features/auth/infrastructure/nest/custom-decorators";
import {
  UserGuard,
  UserThrottlerGuard,
} from "@features/auth/infrastructure/nest/guards/users.guard";
import { myFoodItemFactory } from "@features/foodlog/factories/food-item.factory";
import { myFoodReportReviewFactory } from "@features/foodlog/factories/food-report-review.factory";
import { IFoodItemUseCase } from "@features/foodlog/ports/food-item.use-case.definition";
import { IFoodReportReviewUseCase } from "@features/foodlog/ports/food-report-review.use-case.definition";
import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Delete,
  HttpCode,
  Patch,
  Body,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  FRRQueryParamsDTO,
  FoodItemQueryParamsDTO,
  FoodItemUpdateInputDTO,
} from "./controller-dtos/frr.dto";
import { FoodReportReview } from "@features/foodlog/entities/food-report-review";
import { CommonErrorResponse } from "@common/nest/api-error.dto";
import { COMMON_FRR_ACTIONS_LIMITS } from "../../rate-limit.config";
import { Throttle } from "@nestjs/throttler";

@ApiTags("frr")
@Controller({
  path: "frr",
  version: "1",
})
export class FoodReportReviewControllerV1 {
  private readonly foodReportReviewUseCase: IFoodReportReviewUseCase;
  private readonly foodItemUseCase: IFoodItemUseCase;
  constructor() {
    const { foodReportReviewUseCase } = myFoodReportReviewFactory();
    const { foodItemUseCase } = myFoodItemFactory();
    this.foodItemUseCase = foodItemUseCase;

    this.foodReportReviewUseCase = foodReportReviewUseCase;
  }

  @Get()
  @UseGuards(UserGuard, UserThrottlerGuard)
  @Throttle(COMMON_FRR_ACTIONS_LIMITS)
  @ApiBearerAuth()
  @ApiOkResponse({ type: FoodReportReview, isArray: true })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiNotFoundResponse({
    type: CommonErrorResponse,
    description: "if no meal report review is found",
  })
  @ApiOperation({
    summary: "Get all food report reviews from the meal report review",
  })
  getFoodReportReviews(
    @GetUser() user: User,
    @Query() query: FRRQueryParamsDTO
  ) {
    return this.foodReportReviewUseCase.getManyBy(
      {
        searchBy: {
          mealReviewReportId: query.mrrId,
        },
      },
      user.appUser
    );
  }

  @Get(":id")
  @UseGuards(UserGuard, UserThrottlerGuard)
  @Throttle(COMMON_FRR_ACTIONS_LIMITS)
  @ApiBearerAuth()
  @ApiOkResponse({ type: FoodReportReview })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiNotFoundResponse({
    type: CommonErrorResponse,
    description: "if the meal report review or food report review is not found",
  })
  @ApiOperation({
    summary: "Get a food report review from a meal report review",
  })
  async getFoodReportReview(
    @GetUser() user: User,
    @Query() query: FRRQueryParamsDTO,
    @Param("id") id: string
  ) {
    const frr = await this.foodReportReviewUseCase.getOneBy(
      {
        searchBy: {
          id,
          mealReviewReportId: query.mrrId,
        },
      },
      user.appUser
    );

    if (!frr) {
      throw new PresentationError(
        "food report review not found",
        ErrorCode.NOT_FOUND
      );
    }

    return frr;
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(UserGuard, UserThrottlerGuard)
  @Throttle(COMMON_FRR_ACTIONS_LIMITS)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiNotFoundResponse({
    type: CommonErrorResponse,
    description: "if the meal report review or food report review is not found",
  })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiOperation({
    summary: "Delete a food report review from a meal report review",
  })
  deleteFoodReportReview(
    @GetUser() user: User,
    @Query() query: FRRQueryParamsDTO,
    @Param("id") id: string
  ) {
    return this.foodReportReviewUseCase.delete(
      {
        searchBy: {
          id,
          mealReviewReportId: query.mrrId,
        },
      },
      user.appUser
    );
  }

  @Patch(":id/change-food")
  @UseGuards(UserGuard, UserThrottlerGuard)
  @Throttle(COMMON_FRR_ACTIONS_LIMITS)
  @ApiBearerAuth()
  @ApiOkResponse({ type: FoodReportReview })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiNotFoundResponse({
    type: CommonErrorResponse,
    description:
      "if the meal report review, food report review or suggestion is not found",
  })
  @ApiOperation({
    summary:
      "Change the found food of the food report review by one of the suggestions",
  })
  changeFoundFoodTo(
    @GetUser() user: User,
    @Query() query: FoodItemQueryParamsDTO,
    @Param("id") id: string
  ) {
    return this.foodItemUseCase.changeFoundFoodBySuggestion(
      {
        searchBy: {
          id: query.suggestionId,
          mealReportReviewId: query.mrrId,
          foodReportReviewId: id,
        },
      },
      user.appUser
    );
  }

  @Patch(":id/found-food")
  @UseGuards(UserGuard, UserThrottlerGuard)
  @Throttle(COMMON_FRR_ACTIONS_LIMITS)
  @ApiBearerAuth()
  @ApiOkResponse({ type: FoodReportReview })
  @ApiUnauthorizedResponse({ type: CommonErrorResponse })
  @ApiBadRequestResponse({ type: CommonErrorResponse })
  @ApiNotFoundResponse({
    type: CommonErrorResponse,
    description:
      "if the meal report review, food report review or the found food is not found",
  })
  @ApiOperation({
    summary: "Update the found food of the food report review",
  })
  updateFoundFood(
    @GetUser() user: User,
    @Query() query: FRRQueryParamsDTO,
    @Body() requestData: FoodItemUpdateInputDTO,
    @Param("id") id: string
  ) {
    return this.foodItemUseCase.updateFoundFood(
      {
        searchBy: {
          mealReportReviewId: query.mrrId,
          foodReportReviewId: id,
        },
        data: {
          amount: requestData.amount,
        },
      },
      user.appUser
    );
  }
}
