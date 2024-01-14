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
  createInputTestFoodReport,
} from "../test-utils/mrr-input-test-data";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { AppUser } from "@features/auth/entities/app-user";
import { ApplicationError, ErrorCode } from "@common/errors";
import { FoodReportReview } from "@features/foodlog/entities/food-report-review";
import { getError, NoErrorThrownError } from "test/test-utils";
import { IFoodItemUseCase } from "@features/foodlog/ports/food-item.use-case.definition";
import { myFoodItemFactory } from "@features/foodlog/factories/food-item.factory";
import { FoodItemUseCase } from "@features/foodlog/use-cases/food-item.use-case";
import { FoodItem } from "@features/foodlog/entities/food-item";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("food item use-case", () => {
  let foodItemUseCase: IFoodItemUseCase;
  let mealReportReviewUseCase: IMealReportReviewUseCase;
  let appUser1: AppUser;
  let appUser2: AppUser;
  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const foodItemFactory = myFoodItemFactory(
      TestDBHelper.instance.firestoreClient
    );
    const mealReportReviewFactory = myMealReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    mealReportReviewUseCase = mealReportReviewFactory.mealReportReviewUseCase;
    foodItemUseCase = foodItemFactory.foodItemUseCase;
    (foodItemUseCase as FoodItemUseCase).setDependencies(
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

  describe("Change food by suggestion", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;
    let foundFood1: FoodItem;
    let suggestion1: FoodItem;

    let mealReportReview2: MealReportReview;
    let foodReportReview2: FoodReportReview;
    let suggestion2: FoodItem;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audio-id-1",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
          }),
        ],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput1
      );
      foodReportReview1 = mealReportReview1.foodReports![0];
      foundFood1 = foodReportReview1.systemResult.foundFoodItem!;
      suggestion1 = foodReportReview1.systemResult.suggestions![0];

      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audio-id-2",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: null,
            suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
          }),
        ],
        mealRecordedAt: new Date(),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
      foodReportReview2 = mealReportReview2.foodReports![0];
      suggestion2 = foodReportReview2.systemResult.suggestions![0];
    });

    it("should change the 'found food' by one of the suggestions", async () => {
      await foodItemUseCase.changeFoundFoodBySuggestion(
        {
          searchBy: {
            mealReportReviewId: mealReportReview1.id,
            foodReportReviewId: foodReportReview1.id,
            id: suggestion1.id,
          },
        },
        appUser1
      );
      const mealReportReview = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: { id: mealReportReview1.id },
          options: { fetchFoodReports: true },
        },
        appUser1
      );
      const foodReportReview = mealReportReview?.foodReports![0];
      const foundFood = foodReportReview?.systemResult.foundFoodItem;
      const suggestionIds = foodReportReview?.systemResult.suggestions?.map(
        (suggestion) => suggestion.id
      );

      expect(foundFood).not.toBe(null);
      expect(foundFood?.id).toBe(suggestion1.id);
      // the suggestions list must remain the same, we are just changing the found food
      // by one of the suggestions
      expect(suggestionIds?.length).toBe(2);
      // The old found food must inside the suggestions
      expect(suggestionIds).toContain(foundFood1.id);
      // The suggestion that was changed must not be inside the suggestions
      expect(suggestionIds).not.toContain(suggestion1.id);
    });

    it("should change 'null found food' by one of the suggestions", async () => {
      await foodItemUseCase.changeFoundFoodBySuggestion(
        {
          searchBy: {
            mealReportReviewId: mealReportReview2.id,
            foodReportReviewId: foodReportReview2.id,
            id: suggestion2.id,
          },
        },
        appUser2
      );
      const mealReportReview = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: { id: mealReportReview2.id },
          options: { fetchFoodReports: true },
        },
        appUser2
      );
      const foodReportReview = mealReportReview?.foodReports![0];
      const foundFood = foodReportReview?.systemResult.foundFoodItem;
      const suggestionIds = foodReportReview?.systemResult.suggestions?.map(
        (suggestion) => suggestion.id
      );

      expect(foundFood).not.toBe(null);
      expect(foundFood?.id).toBe(suggestion2.id);
      // the suggestions must have lost one item, as the found food was null
      expect(suggestionIds?.length).toBe(1);
      // The suggestion that was changed must not be inside the suggestions
      expect(suggestionIds).not.toContain(suggestion2.id);
    });

    it("should throw an error if meal report review does not exits", async () => {
      const error = await getError(async () =>
        foodItemUseCase.changeFoundFoodBySuggestion(
          {
            searchBy: {
              mealReportReviewId: "asdasd",
              foodReportReviewId: foodReportReview1.id,
              id: suggestion1.id,
            },
          },
          appUser1
        )
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
    });

    it("should throw an error if food report review does not exits", async () => {
      const error = await getError(async () =>
        foodItemUseCase.changeFoundFoodBySuggestion(
          {
            searchBy: {
              mealReportReviewId: mealReportReview1.id,
              foodReportReviewId: "asdasd",
              id: suggestion1.id,
            },
          },
          appUser1
        )
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
    });

    it("should throw an error if suggestion does not exits", async () => {
      const error = await getError(async () =>
        foodItemUseCase.changeFoundFoodBySuggestion(
          {
            searchBy: {
              mealReportReviewId: mealReportReview1.id,
              foodReportReviewId: foodReportReview1.id,
              id: "asdasd",
            },
          },
          appUser1
        )
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
    });
  });

  describe("Change food by suggestion", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audio-id-1",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: createInputTestFoodItem(),
            suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
          }),
        ],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput1
      );
      foodReportReview1 = mealReportReview1.foodReports![0];

      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audio-id-2",
        foodReports: [
          createInputTestFoodReport({
            foundFoodItem: null,
            suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
          }),
        ],
        mealRecordedAt: new Date(),
      });
      await mealReportReviewUseCase.create(mealReportReviewInput2);
    });

    it("should update the amount of 'found food'", async () => {
      await foodItemUseCase.updateFoundFood(
        {
          data: {
            amount: 150,
          },
          searchBy: {
            mealReportReviewId: mealReportReview1.id,
            foodReportReviewId: foodReportReview1.id,
          },
        },
        appUser1
      );
      const mealReportReview = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: { id: mealReportReview1.id },
          options: { fetchFoodReports: true },
        },
        appUser1
      );
      const foodReportReview = mealReportReview?.foodReports![0];
      const foundFood = foodReportReview?.systemResult.foundFoodItem;

      expect(foundFood).not.toBe(null);
      expect(foundFood?.amount).toBe(150);
    });

    it("should throw an error if meal report review does not exits", async () => {
      const error = await getError(async () =>
        foodItemUseCase.updateFoundFood(
          {
            data: {
              amount: 150,
            },
            searchBy: {
              mealReportReviewId: "asdasd",
              foodReportReviewId: foodReportReview1.id,
            },
          },
          appUser1
        )
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
    });

    it("should throw an error if food report review does not exits", async () => {
      const error = await getError(async () =>
        foodItemUseCase.updateFoundFood(
          {
            data: {
              amount: 150,
            },
            searchBy: {
              mealReportReviewId: mealReportReview1.id,
              foodReportReviewId: "asdasd",
            },
          },
          appUser1
        )
      );

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toHaveProperty("errorCode", ErrorCode.NOT_FOUND);
    });
  });
});
