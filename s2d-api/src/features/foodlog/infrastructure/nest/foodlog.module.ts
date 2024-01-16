import { Module } from "@nestjs/common";
import { MealReportReviewControllerV1 } from "./controllers/v1/mrr.controller";
import { FoodReportReviewControllerV1 } from "./controllers/v1/frr.controller";
import { AudioControllerV1 } from "./controllers/v1/audio.controller";

@Module({
  controllers: [
    MealReportReviewControllerV1,
    FoodReportReviewControllerV1,
    AudioControllerV1,
  ],
})
export class FoodLogModule {}
