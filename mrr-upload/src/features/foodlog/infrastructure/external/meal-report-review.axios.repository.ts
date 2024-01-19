import {
  IMealReportReviewRepository,
  MealReportReviewCreateRepoData,
} from "@features/foodlog/ports/meal-report-review.repository.definition";
import axios from "axios";
import { AppLogger } from "@common/logging/logger";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { getAppSecret } from "@common/config/secrets-vars";
import { ErrorCode, RepositoryError } from "@common/errors";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class MealReportReviewAxiosRepository
  implements IMealReportReviewRepository
{
  constructor(private readonly endpoint: string) {}

  async create(
    input: MealReportReviewCreateRepoData
  ): Promise<MealReportReview> {
    myLogger.debug("creating meal report review");

    const apiKey = await getAppSecret("MRR_UPLOAD_API_KEY");

    myLogger.debug("uploading mrr of user", { appUserId: input.appUserId });
    const response = await axios.post<MealReportReview>(this.endpoint, input, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (response.status !== 201) {
      myLogger.error("error creating meal report review", {
        statusCode: response.status,
        body: response.data,
      });
      throw new RepositoryError(
        `error creating meal report review, status code: ${response.status}`,
        ErrorCode.UNEXPECTED_ERROR
      );
    }

    myLogger.debug(`mrr of user ${input.appUserId} uploaded`);
    return response.data;
  }
}
