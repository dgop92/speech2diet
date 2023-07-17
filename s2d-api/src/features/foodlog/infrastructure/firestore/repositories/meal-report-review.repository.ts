import { FirestoreCollection } from "@common/firebase/utils";
import {
  IMealReportReviewRepository,
  MealReportReviewUpdateRepoData,
} from "@features/foodlog/ports/meal-report-review.repository.definition";
import { Transaction, Query } from "firebase-admin/firestore";
import { FirestoreMealReportReview } from "../entities/meal-report-review.firestore";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { MealReportReviewSearchInput } from "@features/foodlog/schema-types";
import { ErrorCode, RepositoryError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import { firestoreMealReportReviewToDomain } from "../transformers";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

function shouldThrowTransactionError(transactionManager: any) {
  if (transactionManager) {
    throw new RepositoryError(
      "transactions are not supported for this implementation",
      ErrorCode.NOT_IMPLEMENTED
    );
  }
}

function removeFoodReports(
  mealReportReview: FirestoreMealReportReview,
  fetchFoodReports: boolean
) {
  if (fetchFoodReports) {
    return mealReportReview;
  } else {
    const { foodReports, ...mealReportReviewRest } = mealReportReview;
    return mealReportReviewRest;
  }
}

export class MealReportReviewRepository implements IMealReportReviewRepository {
  constructor(
    private readonly collection: FirestoreCollection<FirestoreMealReportReview>
  ) {}

  update(
    mealReportReview: MealReportReview,
    input: MealReportReviewUpdateRepoData
  ): Promise<MealReportReview>;
  update<T>(
    mealReportReview: MealReportReview,
    input: MealReportReviewUpdateRepoData,
    transactionManager?: T | undefined
  ): Promise<MealReportReview>;
  async update(
    mealReportReview: MealReportReview,
    input: MealReportReviewUpdateRepoData,
    transactionManager?: Transaction
  ): Promise<MealReportReview> {
    const mealReportReviewId = mealReportReview.id;
    myLogger.debug("updating meal report review", { mealReportReviewId });
    shouldThrowTransactionError(transactionManager);

    try {
      const mealReportReviewDocRef = this.collection.doc(mealReportReviewId);
      await mealReportReviewDocRef.set(
        { pending: input.pending },
        { merge: true }
      );
      myLogger.debug("meal report review updated", { mealReportReviewId });
      return {
        ...mealReportReview,
        pending: input.pending,
      };
    } catch (error) {
      if (error.code === "not-found") {
        throw new RepositoryError(
          "meal report review not found",
          ErrorCode.NOT_FOUND
        );
      }
      throw error;
    }
  }

  getOneBy(
    input: MealReportReviewSearchInput
  ): Promise<MealReportReview | undefined>;
  getOneBy<T>(
    input: MealReportReviewSearchInput,
    transactionManager?: T | undefined
  ): Promise<MealReportReview | undefined>;
  async getOneBy(
    input: MealReportReviewSearchInput,
    transactionManager?: Transaction
  ): Promise<MealReportReview | undefined> {
    const fetchFoodReports = input.options?.fetchFoodReports ?? false;
    const id = input.searchBy?.id;

    if (!id) {
      throw new RepositoryError(
        "meal report review id is required",
        ErrorCode.INVALID_INPUT
      );
    }

    myLogger.debug("getting meal report review", { id });
    shouldThrowTransactionError(transactionManager);

    const mealReportReviewDocRef = this.collection.doc(id);
    const mealReportReviewDoc = await mealReportReviewDocRef.get();
    if (!mealReportReviewDoc.exists) {
      myLogger.debug("meal report review not found", { id });
      return undefined;
    }

    const fireStoreMealReportReview = mealReportReviewDoc.data()!;
    const mealReportReview = removeFoodReports(
      fireStoreMealReportReview,
      fetchFoodReports
    );

    myLogger.debug("meal report review found", { id });
    return firestoreMealReportReviewToDomain(mealReportReview);
  }

  delete(mealReportReview: MealReportReview): Promise<void>;
  delete<T>(
    mealReportReview: MealReportReview,
    transactionManager?: T | undefined
  ): Promise<void>;
  async delete(
    mealReportReview: MealReportReview,
    transactionManager?: Transaction
  ): Promise<void> {
    const mealReportReviewId = mealReportReview.id;
    myLogger.debug("deleting meal report review", { mealReportReviewId });
    shouldThrowTransactionError(transactionManager);

    const mealReportReviewDocRef = this.collection.doc(mealReportReviewId);

    try {
      await mealReportReviewDocRef.delete();
    } catch (error) {
      if (error.code === "not-found") {
        throw new RepositoryError(
          "meal report review not found",
          ErrorCode.NOT_FOUND
        );
      }
    }

    myLogger.debug("meal report review deleted", { mealReportReviewId });
  }
  getManyBy(input: MealReportReviewSearchInput): Promise<MealReportReview[]>;
  getManyBy<T>(
    input: MealReportReviewSearchInput,
    transactionManager?: T | Transaction
  ): Promise<MealReportReview[]>;
  async getManyBy(
    input: MealReportReviewSearchInput,
    transactionManager?: Transaction
  ): Promise<MealReportReview[]> {
    const fetchFoodReports = input.options?.fetchFoodReports ?? false;
    const limit = input.pagination?.limit;
    const pending = input.searchBy?.pending;
    const sortBycreatedAt = input.sortBy?.createdAt ?? "desc";

    myLogger.debug("getting meal report reviews", {
      pending,
      limit,
      sortBycreatedAt,
      fetchFoodReports,
    });

    shouldThrowTransactionError(transactionManager);

    let query: Query<FirestoreMealReportReview> = this.collection;

    if (pending !== undefined) {
      query = query.where("pending", "==", pending);
    }

    query = query.orderBy("createdAt", sortBycreatedAt);

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const mealReportReviewDocs = await query.get();
    let mealReportReviews: FirestoreMealReportReview[] = [];

    mealReportReviewDocs.forEach((mealReportReviewDoc) => {
      const mealReportReview = mealReportReviewDoc.data();
      mealReportReviews.push(mealReportReview);
    });

    mealReportReviews = mealReportReviews.map((mealReportReview) =>
      removeFoodReports(mealReportReview, fetchFoodReports)
    );

    myLogger.debug("meal report reviews found", {
      count: mealReportReviews.length,
    });

    return mealReportReviews.map(firestoreMealReportReviewToDomain);
  }
}