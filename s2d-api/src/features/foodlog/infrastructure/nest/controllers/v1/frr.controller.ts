import { ErrorCode, PresentationError } from "@common/errors";
import { AuthUser } from "@features/auth/entities/auth-user";
import { GetAuthUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { AuthUserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import { myFoodReportReviewFactory } from "@features/foodlog/factories/food-report-review.factory";
import { IFoodReportReviewUseCase } from "@features/foodlog/ports/food-report-review.use-case.definition";
import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Delete,
  HttpCode,
} from "@nestjs/common";

type QueryParams = {
  mrrId: string;
};

@Controller({
  path: "frr",
  version: "1",
})
export class FoodReportReviewControllerV1 {
  private readonly foodReportReviewUseCase: IFoodReportReviewUseCase;
  constructor() {
    const { foodReportReviewUseCase } = myFoodReportReviewFactory();
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
}
