import { ErrorCode, PresentationError } from "@common/errors";
import { User } from "@features/auth/entities/user";
import { GetUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { UserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
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

  @UseGuards(UserGuard)
  @Get()
  getFoodReportReviews(@GetUser() user: User, @Query() query: QueryParams) {
    return this.foodReportReviewUseCase.getManyBy(
      {
        searchBy: {
          mealReviewReportId: query.mrrId,
        },
      },
      user.appUser
    );
  }

  @UseGuards(UserGuard)
  @Get(":id")
  async getFoodReportReview(
    @GetUser() user: User,
    @Query() query: QueryParams,
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
        "food Report Review not found",
        ErrorCode.NOT_FOUND
      );
    }

    return frr;
  }

  @UseGuards(UserGuard)
  @HttpCode(204)
  @Delete(":id")
  deleteFoodReportReview(
    @GetUser() user: User,
    @Query() query: QueryParams,
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

  @UseGuards(UserGuard)
  @Patch(":id/change-food")
  changeFoundFoodTo(
    @GetUser() user: User,
    @Query() query: FoodItemQueryParams,
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

  @UseGuards(UserGuard)
  @Patch(":id/found-food")
  updateFoundFood(
    @GetUser() user: User,
    @Query() query: FoodItemQueryParams,
    @Body() requestData: UpdateFoodItemReviewRequest,
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
