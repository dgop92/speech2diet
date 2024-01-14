import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";

import { TestDBHelper } from "test/test-db-helper";
import { myFoodReportReviewFactory } from "@features/foodlog/factories/food-report-review.factory";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import {
  createInputMealReportReview,
  createInputTestFoodItem,
  createInputTestFoodReport,
} from "../test-utils/mrr-input-test-data";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import { IFoodReportReviewUseCase } from "@features/foodlog/ports/food-report-review.use-case.definition";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { AppUser } from "@features/auth/entities/app-user";
import { ApplicationError, ErrorCode } from "@common/errors";
import { FoodReportReviewUseCase } from "@features/foodlog/use-cases/food-report-review.use-case";
import { FoodReportReview } from "@features/foodlog/entities/food-report-review";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("food report review use-case", () => {
  let foodReportReviewUseCase: IFoodReportReviewUseCase;
  let mealReportReviewUseCase: IMealReportReviewUseCase;
  let appUser1: AppUser;
  let appUser2: AppUser;
  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const foodReportReviewFactory = myFoodReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    const mealReportReviewFactory = myMealReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    mealReportReviewUseCase = mealReportReviewFactory.mealReportReviewUseCase;
    foodReportReviewUseCase = foodReportReviewFactory.foodReportReviewUseCase;
    (foodReportReviewUseCase as FoodReportReviewUseCase).setDependencies(
      mealReportReviewUseCase
    );
    deleteAllRecords = () =>
      TestDBHelper.instance.clearCollection(
        mealReportReviewFactory.mealReportReviewCollection
      );

    const appUserFactory = myAppUserFactory(
      TestDBHelper.instance.firestoreClient
    );

    const appUserUseCase = appUserFactory.appUserUseCase;
    appUser1 = await appUserUseCase.create({
      data: { firstName: "au1-f", lastName: "au1-l", userId: "au1-id" },
    });
    appUser2 = await appUserUseCase.create({
      data: { firstName: "au2-f", lastName: "au2-l", userId: "au2-id" },
    });
  });

  afterAll(async () => {
    TestDBHelper.instance.teardownTestDB();
  });

  describe("Delete", () => {
    let mealReportReview1: MealReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audio-id-1",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
    });

    it("should remove one food report from the meal report review", async () => {
      const foodReport = mealReportReview1.foodReports![0];
      await foodReportReviewUseCase.delete(
        {
          searchBy: {
            id: foodReport.id,
            mealReviewReportId: mealReportReview1.id,
          },
        },
        appUser1
      );
      const updatedMealReportReview = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: mealReportReview1.id,
          },
          options: {
            fetchFoodReports: true,
          },
        },
        appUser1
      );
      expect(updatedMealReportReview!.foodReports).toHaveLength(0);
    });
    it("should throw an error if meal report review not found when deleting", async () => {
      try {
        await foodReportReviewUseCase.delete(
          {
            searchBy: {
              id: "frr-id",
              mealReviewReportId: "asdasfd",
            },
          },
          appUser1
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
    it("should throw an error if food report review not found when deleting", async () => {
      try {
        await foodReportReviewUseCase.delete(
          {
            searchBy: {
              id: "frr-id",
              mealReviewReportId: mealReportReview1.id,
            },
          },
          appUser1
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Get One By", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;
    let foodReportReview2: FoodReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audio-id-1",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
          }),
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
      foodReportReview1 = mealReportReview1.foodReports![0];
      foodReportReview2 = mealReportReview1.foodReports![1];
      await mealReportReviewUseCase.create(
        createInputMealReportReview({
          appUserId: appUser2.id,
          audioId: "audio-id-2",
          foodReports: [
            createInputTestFoodReport({
              foundFoodItem: null,
              suggestions: [
                createInputTestFoodItem(),
                createInputTestFoodItem(),
              ],
            }),
          ],
          mealRecordedAt: new Date(),
        })
      );
    });
    it("should get one food report by id", async () => {
      const foodReport = await foodReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: foodReportReview1.id,
            mealReviewReportId: mealReportReview1.id,
          },
        },
        appUser1
      );
      expect(foodReport).toBeDefined();
      expect(foodReport!.id).toBe(foodReportReview1.id);
    });
    it("should not get one food report by id", async () => {
      const foodReport = await foodReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: "adsasdf",
            mealReviewReportId: mealReportReview1.id,
          },
        },
        appUser1
      );
      expect(foodReport).toBeUndefined();
    });
    it("should throw an error if meal report review not found when getting one food report", async () => {
      try {
        await foodReportReviewUseCase.getOneBy(
          {
            searchBy: {
              id: foodReportReview1.id,
              mealReviewReportId: "asdasfd",
            },
          },
          appUser1
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Get Many By", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;
    let foodReportReview2: FoodReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audio-id-1",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
          }),
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
      foodReportReview1 = mealReportReview1.foodReports![0];
      foodReportReview2 = mealReportReview1.foodReports![1];
      await mealReportReviewUseCase.create(
        createInputMealReportReview({
          appUserId: appUser2.id,
          audioId: "audio-id-2",
          foodReports: [],
          mealRecordedAt: new Date(),
        })
      );
    });
    it("should get all food reports of a meal report review", async () => {
      const foodReports = await foodReportReviewUseCase.getManyBy(
        {
          searchBy: {
            mealReviewReportId: mealReportReview1.id,
          },
        },
        appUser1
      );
      const expectedFoodReportIds = [
        foodReportReview1.id,
        foodReportReview2.id,
      ];
      const receivedFoodReportIds = foodReports.map(
        (foodReport) => foodReport.id
      );
      expect(foodReports).toHaveLength(2);
      expect(new Set(receivedFoodReportIds)).toEqual(
        new Set(expectedFoodReportIds)
      );
    });
    it("should throw an error if meal report review not found when getting food reports", async () => {
      try {
        await foodReportReviewUseCase.getManyBy(
          {
            searchBy: {
              mealReviewReportId: "asdasfd",
            },
          },
          appUser1
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });
});
