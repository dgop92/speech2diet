import { Module } from "@nestjs/common";
import { MealReportReviewControllerV1 } from "./controllers/v1/mrr.controller";
import { FoodReportReviewControllerV1 } from "./controllers/v1/frr.controller";

@Module({
  controllers: [MealReportReviewControllerV1, FoodReportReviewControllerV1],
})
export class FoodLogModule {}
