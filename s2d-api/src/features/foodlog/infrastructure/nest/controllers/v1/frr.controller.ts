import { ErrorCode, PresentationError } from "@common/errors";
import { AuthUser } from "@features/auth/entities/auth-user";
import { GetAuthUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { AuthUserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import { myFoodItemFactory } from "@features/foodlog/factories/food-item.factory";
import { myFoodReportReviewFactory } from "@features/foodlog/factories/food-report-review.factory";
import { IFoodItemUseCase } from "@features/foodlog/ports/food-item.use-case.definition";
import { IFoodReportReviewUseCase } from "@features/foodlog/ports/food-report-review.use-case.definition";
import { FoodItemUpdateInput } from "@features/foodlog/schema-types";
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

type QueryParams = {
  mrrId: string;
};

type FoodItemQueryParams = QueryParams & {
  suggestionId: string;
};

type UpdateFoodItemReviewRequest = FoodItemUpdateInput["data"];

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

  @UseGuards(AuthUserGuard)
  @Get()
  getFoodReportReviews(
    @GetAuthUser() user: AuthUser,
    @Query() query: QueryParams
  ) {
    return this.foodReportReviewUseCase.getManyBy({
      searchBy: {
        mealReviewReportId: query.mrrId,
      },
    });
  }

  @UseGuards(AuthUserGuard)
  @Get(":id")
  async getFoodReportReview(
    @GetAuthUser() user: AuthUser,
    @Query() query: QueryParams,
    @Param("id") id: string
  ) {
    const frr = await this.foodReportReviewUseCase.getOneBy({
      searchBy: {
        id,
        mealReviewReportId: query.mrrId,
      },
    });

    if (!frr) {
      throw new PresentationError(
        "food Report Review not found",
        ErrorCode.NOT_FOUND
      );
    }

    return frr;
  }

  @UseGuards(AuthUserGuard)
  @HttpCode(204)
  @Delete(":id")
  deleteFoodReportReview(
    @GetAuthUser() user: AuthUser,
    @Query() query: QueryParams,
    @Param("id") id: string
  ) {
    return this.foodReportReviewUseCase.delete({
      searchBy: {
        id,
        mealReviewReportId: query.mrrId,
      },
    });
  }

  @UseGuards(AuthUserGuard)
  @Patch(":id/change-food")
  changeFoundFoodTo(
    @GetAuthUser() user: AuthUser,
    @Query() query: FoodItemQueryParams,
    @Param("id") id: string
  ) {
    return this.foodItemUseCase.changeFoundFoodBySuggestion({
      searchBy: {
        id: query.suggestionId,
        mealReportReviewId: query.mrrId,
        foodReportReviewId: id,
      },
    });
  }

  @UseGuards(AuthUserGuard)
  @Patch(":id/found-food")
  updateFoundFood(
    @GetAuthUser() user: AuthUser,
    @Query() query: FoodItemQueryParams,
    @Body() requestData: UpdateFoodItemReviewRequest,
    @Param("id") id: string
  ) {
    return this.foodItemUseCase.updateFoundFood({
      searchBy: {
        mealReportReviewId: query.mrrId,
        foodReportReviewId: id,
      },
      data: {
        amount: requestData.amount,
      },
    });
  }
}
