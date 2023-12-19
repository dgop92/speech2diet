import { FirestoreCollection } from "@common/firebase/utils";
import {
  IMealReportReviewRepository,
  MealReportReviewCreateRepoData,
} from "@features/foodlog/ports/meal-report-review.repository.definition";
import { FirestoreMealReportReview } from "../entities/meal-report-review.firestore";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { AppLogger } from "@common/logging/logger";
import {
  firestoreMealReportReviewToDomain,
  mealReportReviewDataToFirestoreMealReportReview,
} from "../transformers";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class MealReportReviewRepository implements IMealReportReviewRepository {
  constructor(
    private readonly collection: FirestoreCollection<FirestoreMealReportReview>
  ) {}

  async create(
    input: MealReportReviewCreateRepoData
  ): Promise<MealReportReview> {
    myLogger.debug("creating meal report review");

    const firestoreMealReportReview =
      mealReportReviewDataToFirestoreMealReportReview(input);

    const mealReportReviewDocRef = this.collection.doc(
      firestoreMealReportReview.id
    );

    await mealReportReviewDocRef.set(firestoreMealReportReview);

    myLogger.debug("meal report review created", {
      mealReportReviewId: firestoreMealReportReview.id,
    });

    return firestoreMealReportReviewToDomain(firestoreMealReportReview);
  }
}
