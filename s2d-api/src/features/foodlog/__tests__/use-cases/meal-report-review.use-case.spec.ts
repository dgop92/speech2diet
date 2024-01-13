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
import { ApplicationError, ErrorCode, RepositoryError } from "@common/errors";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { AppUser } from "@features/auth/entities/app-user";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("meal report review repository", () => {
  let mealReportReviewUseCase: IMealReportReviewUseCase;
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

    deleteAllRecords = () =>
      TestDBHelper.instance.clearCollection(
        mealReportReviewFactory.mealReportReviewCollection
      );
  });

  afterAll(async () => {
    TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllRecords();
    });

    it("should create an meal report review with empty food reports", async () => {
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      const result = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.foodReports).toHaveLength(0);
      expect(result.audioId).toEqual(mealReportReviewInput.data.audioId);
    });
    it("should create an meal report review with one empty food report", async () => {
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: null,
        suggestions: [],
      });
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      const result = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.audioId).toEqual(mealReportReviewInput.data.audioId);
      expect(result.foodReports).toHaveLength(1);
      expect(result?.foodReports?.[0].systemResult.foundFoodItem).toBeNull();
      expect(result?.foodReports?.[0].systemResult.suggestions).toHaveLength(0);
    });
    it("should create an meal report review with one food report with data", async () => {
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      const result = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.audioId).toEqual(mealReportReviewInput.data.audioId);
      expect(result.foodReports).toHaveLength(1);
      expect(result?.foodReports?.[0].systemResult.foundFoodItem).toBeDefined();
      expect(result?.foodReports?.[0].systemResult.suggestions).toHaveLength(2);
    });
  });

  describe("Update", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput1
      );
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-2",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
    });

    it("should update the pending status of an meal report review to true", async () => {
      const result = await mealReportReviewUseCase.update(
        {
          data: { pending: true },
          searchBy: { id: mealReportReview1.id },
        },
        appUser1
      );
      expect(result).toBeDefined();
      expect(result.id).toEqual(mealReportReview1.id);
      expect(result.appUserId).toEqual(mealReportReview1.appUserId);
      expect(result.pending).toBe(true);
    });

    it("should update the pending status of an meal report review to false", async () => {
      const result = await mealReportReviewUseCase.update(
        {
          data: { pending: false },
          searchBy: { id: mealReportReview1.id },
        },
        appUser1
      );
      expect(result).toBeDefined();
      expect(result.id).toEqual(mealReportReview1.id);
      expect(result.appUserId).toEqual(mealReportReview1.appUserId);
      expect(result.pending).toBe(false);
    });
    it("should throw an error if meal report review is not found", async () => {
      try {
        await mealReportReviewUseCase.update(
          {
            data: { pending: false },
            searchBy: { id: "asdgasdg" },
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
    it("should throw an not found error if meal report review does not belong to the app user ", async () => {
      try {
        await mealReportReviewUseCase.update(
          {
            data: { pending: false },
            searchBy: { id: mealReportReview1.id },
          },
          appUser2
        );
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Delete", () => {
    let mealReportReview1: MealReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
    });

    it("should delete a meal report review", async () => {
      await mealReportReviewUseCase.delete(
        {
          searchBy: {
            id: mealReportReview1.id,
          },
        },
        appUser1
      );
      const result = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: mealReportReview1.id,
          },
        },
        appUser1
      );
      expect(result).toBeUndefined();
    });

    it("should throw an error if meal report review does not exist", async () => {
      try {
        await mealReportReviewUseCase.delete(
          {
            searchBy: {
              id: "asfasfajkh",
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

  describe("Get one by", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput1
      );
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-2",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
    });

    it("should get an meal report review by id", async () => {
      const result = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: mealReportReview1.id,
          },
        },
        appUser1
      );
      expect(result).toBeDefined();
      expect(result?.id).toEqual(mealReportReview1.id);
      expect(result?.appUserId).toEqual(mealReportReview1.appUserId);
    });

    it("should get an meal report review by id without fetching its food reports", async () => {
      const result = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: mealReportReview1.id,
          },
        },
        appUser1
      );
      expect(result).toBeDefined();
      expect(result?.id).toEqual(mealReportReview1.id);
      expect(result?.appUserId).toEqual(mealReportReview1.appUserId);
      expect(result?.foodReports).toBeUndefined();
    });

    it("should get an meal report review by id and fetch its food reports", async () => {
      const result = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: mealReportReview2.id,
          },
          options: {
            fetchFoodReports: true,
          },
        },
        appUser2
      );
      expect(result).toBeDefined();
      expect(result?.id).toEqual(mealReportReview2.id);
      expect(result?.appUserId).toEqual(mealReportReview2.appUserId);
      expect(result?.foodReports).toHaveLength(1);
      expect(result?.foodReports?.[0].systemResult.foundFoodItem).toBeDefined();
      expect(result?.foodReports?.[0].systemResult.suggestions).toHaveLength(2);
    });

    it("should not get an meal report review by id", async () => {
      const result = await mealReportReviewUseCase.getOneBy(
        {
          searchBy: {
            id: "asdgsdf",
          },
        },
        appUser1
      );
      expect(result).toBeUndefined();
    });

    it("should throw an error if meal report review id does not belong to the app user", async () => {
      try {
        await mealReportReviewUseCase.getOneBy(
          {
            searchBy: {
              id: mealReportReview1.id,
            },
          },
          appUser1
        );
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Get many by", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;
    let mealReportReview3: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: appUser1.id,
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput1
      );
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-2",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(2023, 1, 10),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
      const mealReportReviewInput3 = createInputMealReportReview({
        appUserId: appUser2.id,
        audioId: "audioId-3",
        foodReports: [],
        mealRecordedAt: new Date(2023, 2, 15),
      });
      mealReportReview3 = await mealReportReviewUseCase.create(
        mealReportReviewInput3
      );
      // pending to false in mealReportReview3
      await mealReportReviewUseCase.update(
        {
          data: {
            pending: false,
          },
          searchBy: {
            id: mealReportReview3.id,
          },
        },
        appUser2
      );
    });

    it("should get all meal report reviews of an app user", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {},
        },
        appUser1
      );
      expect(results).toHaveLength(1);
    });

    it("should get all meal report reviews of an app user without fetching its food reports", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {},
        },
        appUser2
      );
      expect(results).toHaveLength(2);
      expect(results[0].foodReports).toBeUndefined();
      expect(results[1].foodReports).toBeUndefined();
    });

    it("should get all meal report reviews of an app user and fetch its food reports", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {},
          options: {
            fetchFoodReports: true,
          },
        },
        appUser2
      );
      expect(results).toHaveLength(2);
      expect(results[0].foodReports).toBeDefined();
      expect(results[1].foodReports).toBeDefined();
      const foodReportLengths = new Set([
        results[0].foodReports?.length,
        results[1].foodReports?.length,
      ]);
      expect(foodReportLengths).toEqual(new Set([0, 1]));
    });

    it("should get all meal report reviews of an app user sorted by 'meal recorded at' ascending", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {
            appUserId: mealReportReview2.appUserId,
          },
          sortBy: {
            createdAt: "asc",
          },
        },
        appUser2
      );
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(mealReportReview2.id);
      expect(results[1].id).toBe(mealReportReview3.id);
    });

    it("should get all meal report reviews of an app user sorted by 'meal recorded at' descending", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {},
          sortBy: {
            createdAt: "desc",
          },
        },
        appUser2
      );
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(mealReportReview3.id);
      expect(results[1].id).toBe(mealReportReview2.id);
    });

    it("should get all meal report reviews of an app user sorted by 'meal recorded at' ascending with limit", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {},
          sortBy: {
            createdAt: "asc",
          },
          pagination: {
            limit: 1,
          },
        },
        appUser2
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview2.id);
    });

    it("should get all meal report reviews of an app user sorted by 'meal recorded at' descending with limit", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {},
          sortBy: {
            createdAt: "desc",
          },
          pagination: {
            limit: 1,
          },
        },
        appUser2
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview3.id);
    });

    it("should get all pending meal report reviews of an app user", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {
            pending: true,
          },
        },
        appUser2
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview2.id);
    });

    it("should get all non-pending meal report reviews of an app user", async () => {
      const results = await mealReportReviewUseCase.getManyBy(
        {
          searchBy: {
            pending: false,
          },
        },
        appUser2
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview3.id);
    });
  });
});
