import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";

import { TestDBHelper } from "test/test-db-helper";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { IMealReportReviewRepository } from "@features/foodlog/ports/meal-report-review.repository.definition";
import {
  createInputMealReportReview,
  createInputTestFoodItem,
  createInputTestFoodReport,
} from "../test-utils/mrr-input-test-data";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import { ErrorCode, RepositoryError } from "@common/errors";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("meal report review repository", () => {
  let mealReportReviewRepository: IMealReportReviewRepository;
  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
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

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllRecords();
    });

    it("should create an meal report review with empty food reports", async () => {
      const mealReportReviewInput = createInputMealReportReview({
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      const result = await mealReportReviewRepository.create(
        mealReportReviewInput.data
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
        audioId: "audioId-1",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      const result = await mealReportReviewRepository.create(
        mealReportReviewInput.data
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
        audioId: "audioId-1",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      const result = await mealReportReviewRepository.create(
        mealReportReviewInput.data
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

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput = createInputMealReportReview({
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewRepository.create(
        mealReportReviewInput.data
      );
    });

    it("should update the pending status of an meal report review to true", async () => {
      const result = await mealReportReviewRepository.update(
        mealReportReview1,
        { pending: true }
      );
      expect(result).toBeDefined();
      expect(result.id).toEqual(mealReportReview1.id);
      expect(result.pending).toBe(true);
    });

    it("should update the pending status of an meal report review to false", async () => {
      const result = await mealReportReviewRepository.update(
        mealReportReview1,
        { pending: false }
      );
      expect(result).toBeDefined();
      expect(result.id).toEqual(mealReportReview1.id);
      expect(result.pending).toBe(false);
    });
  });

  describe("Get one by", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: "appUserId-1",
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewRepository.create(
        mealReportReviewInput1.data
      );
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: "appUserId-2",
        audioId: "audioId-2",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      mealReportReview2 = await mealReportReviewRepository.create(
        mealReportReviewInput2.data
      );
    });

    it("should get an meal report review by id", async () => {
      const result = await mealReportReviewRepository.getOneBy({
        searchBy: {
          id: mealReportReview1.id,
          appUserId: mealReportReview1.appUserId,
        },
      });
      expect(result).toBeDefined();
      expect(result?.id).toEqual(mealReportReview1.id);
      expect(result?.appUserId).toEqual(mealReportReview1.appUserId);
    });

    it("should get an meal report review by id without fetching its food reports", async () => {
      const result = await mealReportReviewRepository.getOneBy({
        searchBy: {
          id: mealReportReview1.id,
          appUserId: mealReportReview1.appUserId,
        },
      });
      expect(result).toBeDefined();
      expect(result?.id).toEqual(mealReportReview1.id);
      expect(result?.appUserId).toEqual(mealReportReview1.appUserId);
      expect(result?.foodReports).toBeUndefined();
    });

    it("should get an meal report review by id and fetch its food reports", async () => {
      const result = await mealReportReviewRepository.getOneBy({
        searchBy: {
          id: mealReportReview2.id,
          appUserId: mealReportReview2.appUserId,
        },
        options: {
          fetchFoodReports: true,
        },
      });
      expect(result).toBeDefined();
      expect(result?.id).toEqual(mealReportReview2.id);
      expect(result?.appUserId).toEqual(mealReportReview2.appUserId);
      expect(result?.foodReports).toHaveLength(1);
      expect(result?.foodReports?.[0].systemResult.foundFoodItem).toBeDefined();
      expect(result?.foodReports?.[0].systemResult.suggestions).toHaveLength(2);
    });

    it("should not get an meal report review by id", async () => {
      const result = await mealReportReviewRepository.getOneBy({
        searchBy: {
          id: "asdgsdf",
          appUserId: mealReportReview1.appUserId,
        },
      });
      expect(result).toBeUndefined();
    });

    it("should throw an error if meal report review id does not belong to app user id", async () => {
      try {
        await mealReportReviewRepository.getOneBy({
          searchBy: {
            id: mealReportReview1.id,
            appUserId: mealReportReview2.appUserId,
          },
        });
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
        appUserId: "appUserId-1",
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewRepository.create(
        mealReportReviewInput1.data
      );
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: "appUserId-2",
        audioId: "audioId-2",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(2023, 1, 10),
      });
      mealReportReview2 = await mealReportReviewRepository.create(
        mealReportReviewInput2.data
      );
      const mealReportReviewInput3 = createInputMealReportReview({
        appUserId: "appUserId-2",
        audioId: "audioId-3",
        foodReports: [],
        mealRecordedAt: new Date(2023, 2, 15),
      });
      mealReportReview3 = await mealReportReviewRepository.create(
        mealReportReviewInput3.data
      );
      // pending to false in mealReportReview3
      await mealReportReviewRepository.update(mealReportReview3, {
        pending: false,
      });
    });

    it("should get all meal report reviews of an app user", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview1.appUserId,
        },
      });
      expect(results).toHaveLength(1);
    });

    it("should get all meal report reviews of an app user without fetching its food reports", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
        },
      });
      expect(results).toHaveLength(2);
      expect(results[0].foodReports).toBeUndefined();
      expect(results[1].foodReports).toBeUndefined();
    });

    it("should get all meal report reviews of an app user and fetch its food reports", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
        },
        options: {
          fetchFoodReports: true,
        },
      });
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
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
        },
        sortBy: {
          createdAt: "asc",
        },
      });
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(mealReportReview2.id);
      expect(results[1].id).toBe(mealReportReview3.id);
    });

    it("should get all meal report reviews of an app user sorted by 'meal recorded at' descending", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
        },
        sortBy: {
          createdAt: "desc",
        },
      });
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(mealReportReview3.id);
      expect(results[1].id).toBe(mealReportReview2.id);
    });

    it("should get all meal report reviews of an app user sorted by 'meal recorded at' ascending with limit", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
        },
        sortBy: {
          createdAt: "asc",
        },
        pagination: {
          limit: 1,
        },
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview2.id);
    });

    it("should get all meal report reviews of an app user sorted by 'meal recorded at' descending with limit", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
        },
        sortBy: {
          createdAt: "desc",
        },
        pagination: {
          limit: 1,
        },
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview3.id);
    });

    it("should get all pending meal report reviews of an app user", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
          pending: true,
        },
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview2.id);
    });

    it("should get all non-pending meal report reviews of an app user", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: mealReportReview2.appUserId,
          pending: false,
        },
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(mealReportReview3.id);
    });

    it("should not get any meal report reviews of an app user that does not exist", async () => {
      const results = await mealReportReviewRepository.getManyBy({
        searchBy: {
          appUserId: "asdgasdg",
        },
      });
      expect(results).toHaveLength(0);
    });

    it("should throw an error if app user is not defined", async () => {
      try {
        await mealReportReviewRepository.getManyBy({
          searchBy: {},
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.INVALID_INPUT);
        }
      }
    });
  });
});
