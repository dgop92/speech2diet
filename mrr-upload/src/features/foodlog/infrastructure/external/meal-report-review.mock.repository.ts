import {
  IMealReportReviewRepository,
  MealReportReviewCreateRepoData,
} from "@features/foodlog/ports/meal-report-review.repository.definition";
import { AppLogger } from "@common/logging/logger";
import {
  DBLookupPreference,
  MealReportReview,
} from "@features/foodlog/entities/meal-report-review";

const dummyMRR: MealReportReview = {
  audioId: "beee-4b97",
  dbLookupPreference: DBLookupPreference.SYSTEM_DB,
  foodReports: [],
  mealRecordedAt: new Date("2021-12-01T12:00:00.000Z"),
  rawTranscript: "hellow",
  appUserId: "123",
  pending: false,
  id: "123-456-789",
};

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class MealReportReviewMockRepository
  implements IMealReportReviewRepository
{
  constructor() {}

  async create(
    input: MealReportReviewCreateRepoData
  ): Promise<MealReportReview> {
    myLogger.debug("creating meal report review");
    // do nothing here because we are mocking the repository
    myLogger.debug(`mrr of user ${input.appUserId} uploaded`);
    return dummyMRR;
  }
}
