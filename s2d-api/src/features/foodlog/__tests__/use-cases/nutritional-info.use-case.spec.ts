import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";

import { TestDBHelper } from "test/test-db-helper";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import {
  createInputMealReportReview,
  createInputTestFoodItem,
  createInputTestFoodItemWithInfo,
  createInputTestFoodReport,
  createInputTestFoodWithInfo,
} from "../test-utils/mrr-input-test-data";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { AppUser } from "@features/auth/entities/app-user";
import { NutritionalInfoUseCase } from "@features/foodlog/use-cases/nutritional-info.use-case";
import { getError, NoErrorThrownError } from "test/test-utils";
import { ApplicationError, ErrorCode } from "@common/errors";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("nutritional info use-case", () => {
  let mealReportReviewUseCase: IMealReportReviewUseCase;
  let nutrientInfoUseCase: NutritionalInfoUseCase;
  let appUser1: AppUser;
  let appUser2: AppUser;

  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const mealReportReviewFactory = myMealReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    const appUserFactory = myAppUserFactory(
      TestDBHelper.instance.firestoreClient
    );

    mealReportReviewUseCase = mealReportReviewFactory.mealReportReviewUseCase;

    const appUserUseCase = appUserFactory.appUserUseCase;
    appUser1 = await appUserUseCase.create({
      data: { firstName: "au1-f", lastName: "au1-l", userId: "au1-id" },
    });
    appUser2 = await appUserUseCase.create({
      data: { firstName: "au2-f", lastName: "au2-l", userId: "au2-id" },
    });

    nutrientInfoUseCase = new NutritionalInfoUseCase(mealReportReviewUseCase);

    deleteAllRecords = () =>
      TestDBHelper.instance.clearCollection(
        mealReportReviewFactory.mealReportReviewCollection
      );
  });

  afterAll(async () => {
    TestDBHelper.instance.teardownTestDB();
  });

  describe("Nutritional Info Between Dates", () => {
    let mealReportReview2: MealReportReview;
    let mealReportReview4: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      // From user 1
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date("2023-01-10T17:10:43.000Z"),
      });
      await mealReportReviewUseCase.create(mealReportReviewInput1);
      /*
      All nutriounal Information for user 2 is as follows:
        mrr2: 104 calories, 8 fat, 16 protein, 20 carbohydrates
        mrr4:
        180 calories, 30 fat, 12 protein, 36 carbohydrates
        75 calories, 15 fat, 1.25 protein, 2.5 carbohydrates

        Total:
        359 calories, 53 fat, 29.25 protein, 58.5 carbohydrates
      */

      // From user 2 - meal report review 2
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-21",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItemWithInfo(
              80,
              createInputTestFoodWithInfo({
                calories: 130,
                fat: 10,
                protein: 20,
                carbohydrates: 25,
              })
            ),
            suggestions: [],
          }),
          createInputTestFoodReport({
            foundFoodItem: null,
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date("2023-01-10T06:10:43.000Z"),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
      await mealReportReviewUseCase.update(
        {
          data: {
            pending: false,
          },
          searchBy: {
            id: mealReportReview2.id,
          },
        },
        appUser2
      );
      // From user 2 - meal report review 3
      const mealReportReviewInput3 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-22",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date("2023-01-10T12:10:43.000Z"),
      });
      await mealReportReviewUseCase.create(mealReportReviewInput3);
      // From user 2 - meal report review 4
      const mealReportReviewInput4 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-23",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItemWithInfo(
              120,
              createInputTestFoodWithInfo({
                calories: 150,
                fat: 25,
                protein: 10,
                carbohydrates: 30,
              })
            ),
            suggestions: [],
          }),
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItemWithInfo(
              25,
              createInputTestFoodWithInfo({
                calories: 300,
                fat: 60,
                protein: 5,
                carbohydrates: 10,
              })
            ),
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date("2023-01-10T14:23:03.000Z"),
      });
      mealReportReview4 = await mealReportReviewUseCase.create(
        mealReportReviewInput4
      );
      await mealReportReviewUseCase.update(
        {
          data: {
            pending: false,
          },
          searchBy: {
            id: mealReportReview4.id,
          },
        },
        appUser2
      );
    });

    it("should get final nutritional info of all meal report reviews of 2023-01-10 that are not pending", async () => {
      const nutrientInfo =
        await nutrientInfoUseCase.getNutritionalInfoBetweenDates(
          "2023-01-10T00:00:00.000Z",
          "2023-01-10T23:59:59.999Z",
          appUser2
        );

      expect(nutrientInfo.calories).toBeCloseTo(359);
      expect(nutrientInfo.fat).toBeCloseTo(53);
      expect(nutrientInfo.protein).toBeCloseTo(29.25);
      expect(nutrientInfo.carbohydrates).toBeCloseTo(58.5);
    });
    it("should get empty final nutritional info when there are no meal report reviews during a specific date", async () => {
      const nutrientInfo =
        await nutrientInfoUseCase.getNutritionalInfoBetweenDates(
          "2023-01-15T00:00:00.000Z",
          "2023-01-15T23:59:59.999Z",
          appUser2
        );

      expect(nutrientInfo.calories).toBeCloseTo(0);
      expect(nutrientInfo.fat).toBeCloseTo(0);
      expect(nutrientInfo.protein).toBeCloseTo(0);
      expect(nutrientInfo.carbohydrates).toBeCloseTo(0);
    });
  });

  describe("Nutritional Info Of Mrr", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;
    let mealReportReview4: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      // From user 1
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date("2023-01-10T17:10:43.000Z"),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput1
      );
      // From user 2 - meal report review 2
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-21",
        foodReports: [],
        mealRecordedAt: new Date("2023-01-10T17:10:43.000Z"),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
      /*
      All nutriounal Information for mrr4 is as follows:
        180 calories, 30 fat, 12 protein, 36 carbohydrates
        75 calories, 15 fat, 1.25 protein, 2.5 carbohydrates

        Total:
        255 calories, 45 fat, 13.25 protein, 38.5 carbohydrates
      */
      // From user 2 - meal report review 4
      const mealReportReviewInput4 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-23",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItemWithInfo(
              120,
              createInputTestFoodWithInfo({
                calories: 150,
                fat: 25,
                protein: 10,
                carbohydrates: 30,
              })
            ),
            suggestions: [],
          }),
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItemWithInfo(
              25,
              createInputTestFoodWithInfo({
                calories: 300,
                fat: 60,
                protein: 5,
                carbohydrates: 10,
              })
            ),
            suggestions: [],
          }),
          createInputTestFoodReport({
            foundFoodItem: null,
            suggestions: [],
          }),
        ],
        mealRecordedAt: new Date("2023-01-10T14:23:03.000Z"),
      });
      mealReportReview4 = await mealReportReviewUseCase.create(
        mealReportReviewInput4
      );
    });

    it("should get final nutritional info of a meal report review", async () => {
      const nutrientInfo = await nutrientInfoUseCase.getNutritionalInfo(
        mealReportReview4.id,
        appUser2
      );

      expect(nutrientInfo.mrr.id).toBe(mealReportReview4.id);

      expect(nutrientInfo.nutritionalInfo.calories).toBeCloseTo(255);
      expect(nutrientInfo.nutritionalInfo.fat).toBeCloseTo(45);
      expect(nutrientInfo.nutritionalInfo.protein).toBeCloseTo(13.25);
      expect(nutrientInfo.nutritionalInfo.carbohydrates).toBeCloseTo(38.5);
    });
    it("should get empty final nutritional info when there are no food reports in a meal report review", async () => {
      const nutrientInfo = await nutrientInfoUseCase.getNutritionalInfo(
        mealReportReview2.id,
        appUser2
      );

      expect(nutrientInfo.mrr.id).toBe(mealReportReview2.id);

      expect(nutrientInfo.nutritionalInfo.calories).toBe(0);
      expect(nutrientInfo.nutritionalInfo.fat).toBe(0);
      expect(nutrientInfo.nutritionalInfo.protein).toBe(0);
      expect(nutrientInfo.nutritionalInfo.carbohydrates).toBe(0);
    });
    it("should throw an error when the meal report review does not belong to the user", async () => {
      const error = await getError(async () =>
        nutrientInfoUseCase.getNutritionalInfo(mealReportReview1.id, appUser2)
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
    });
    it("should throw an error when the meal report review does not exit", async () => {
      const error = await getError(async () =>
        nutrientInfoUseCase.getNutritionalInfo("asdasd", appUser2)
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
    });
  });
});
