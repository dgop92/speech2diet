import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";

import { TestDBHelper } from "test/test-db-helper";
import { myFoodReportReviewFactory } from "@features/foodlog/factories/food-report-review.factory";
import { IFoodReportReviewRepository } from "@features/foodlog/ports/food-report-review.repository.definition";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import {
  createInputMealReportReview,
  createInputTestFoodItem,
  createInputTestFoodReport,
} from "../test-utils/mrr-input-test-data";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { IMealReportReviewRepository } from "@features/foodlog/ports/meal-report-review.repository.definition";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("food report review repository", () => {
  let foodReportReviewRepository: IFoodReportReviewRepository;
  let mealReportReviewRepository: IMealReportReviewRepository;
  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const foodReportReviewFactory = myFoodReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    foodReportReviewRepository =
      foodReportReviewFactory.foodReportReviewRepository;

    const mealReportReviewFactory = myMealReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    mealReportReviewRepository =
      mealReportReviewFactory.mealReportReviewRepository;
    deleteAllRecords = () =>
      TestDBHelper.instance.clearCollection(
        mealReportReviewFactory.mealReportReviewCollection
      );
  });

  afterAll(async () => {
    TestDBHelper.instance.teardownTestDB();
  });

  describe("Remove Food Report Review", () => {
    let mealReportReview1: MealReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput = createInputMealReportReview({
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewRepository.create(
        mealReportReviewInput.data
      );
    });

    it("should remove one food report from the meal report review", async () => {
      const foodReport = mealReportReview1.foodReports![0];
      await foodReportReviewRepository.removeFoodReportReview(
        foodReport,
        mealReportReview1
      );
      const updatedMealReportReview = await mealReportReviewRepository.getOneBy(
        {
          searchBy: {
            id: mealReportReview1.id,
            appUserId: mealReportReview1.appUserId,
          },
          options: {
            fetchFoodReports: true,
          },
        }
      );
      expect(updatedMealReportReview!.foodReports).toHaveLength(0);
    });

    it("should do nothing when the food report was already deleted", async () => {
      const foodReport = mealReportReview1.foodReports![0];
      await foodReportReviewRepository.removeFoodReportReview(
        foodReport,
        mealReportReview1
      );
      const updatedMealReportReview = await mealReportReviewRepository.getOneBy(
        {
          searchBy: {
            id: mealReportReview1.id,
            appUserId: mealReportReview1.appUserId,
          },
          options: {
            fetchFoodReports: true,
          },
        }
      );
      expect(updatedMealReportReview!.foodReports).toHaveLength(0);
      await foodReportReviewRepository.removeFoodReportReview(
        foodReport,
        mealReportReview1
      );
      const updatedMealReportReview2 =
        await mealReportReviewRepository.getOneBy({
          searchBy: {
            id: mealReportReview1.id,
            appUserId: mealReportReview1.appUserId,
          },
          options: {
            fetchFoodReports: true,
          },
        });
      expect(updatedMealReportReview2!.foodReports).toHaveLength(0);
    });
  });
});
