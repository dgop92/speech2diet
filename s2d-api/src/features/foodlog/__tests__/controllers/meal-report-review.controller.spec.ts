import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { FoodLogModule } from "@features/foodlog/infrastructure/nest/foodlog.module";
import { TestDBHelper } from "test/test-db-helper";
import { IMealReportReviewUseCase } from "@features/foodlog/ports/meal-report-review.use-case.definition";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { TestAuthDBHelper } from "test/test-auth-db-helper";
import { authFactory } from "@features/auth/factories";
import { User } from "@features/auth/entities/user";
import { MealReportReview } from "@features/foodlog/entities/meal-report-review";
import {
  createInputMealReportReview,
  createInputTestFoodItem,
  createInputTestFoodReport,
} from "../test-utils/mrr-input-test-data";
import {
  WinstonLogger,
  createTestLogger,
} from "@common/logging/winston-logger";
import { AppLogger } from "@common/logging/logger";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("meal report review (e2e)", () => {
  let app: INestApplication;

  let mealReportReviewUseCase: IMealReportReviewUseCase;
  let user1: User;
  let user2: User;

  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const mealReportReviewFactory = myMealReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    mealReportReviewUseCase = mealReportReviewFactory.mealReportReviewUseCase;
    deleteAllRecords = () =>
      TestDBHelper.instance.clearCollection(
        mealReportReviewFactory.mealReportReviewCollection
      );

    await TestAuthDBHelper.instance.setupTestAuthDB();
    // clean up auth users before running all tests
    await TestAuthDBHelper.instance.deleteAllUsers();
    const authFactoryMod = authFactory(
      TestAuthDBHelper.instance.authFirebaseClient,
      TestDBHelper.instance.firestoreClient
    );
    const userServiceUseCase =
      authFactoryMod.userServiceFactory.userServiceUseCase;

    user1 = await userServiceUseCase.create({
      appUserData: { firstName: "au1-f", lastName: "au1-l" },
      authUserData: { email: "au1@ex.com", password: "secretPASS1234" },
    });
    user2 = await userServiceUseCase.create({
      appUserData: { firstName: "au2-f", lastName: "au2-l" },
      authUserData: { email: "au2@ex.com", password: "secretPASS1234" },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FoodLogModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
    await TestAuthDBHelper.instance.teardownTestAuthDB();
    await app.close();
  });

  describe("GET /mrr", () => {
    let mealReportReview2: MealReportReview;
    let mealReportReview3: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: user1.appUser.id,
        audioId: "audioId-1",
        foodReports: [],
        mealRecordedAt: new Date(),
      });
      await mealReportReviewUseCase.create(mealReportReviewInput1);
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: user2.appUser.id,
        audioId: "audioId-2",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(2023, 1, 10),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
      const mealReportReviewInput3 = createInputMealReportReview({
        appUserId: user2.appUser.id,
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
        user2.appUser
      );
    });

    // normal cases and query parameters

    it("should fetch all meal report reviews of a user", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          const expectedIds = new Set([
            mealReportReview2.id,
            mealReportReview3.id,
          ]);
          const actualIds = new Set(
            res.body.map((mrr: MealReportReview) => mrr.id)
          );
          expect(actualIds).toEqual(expectedIds);
        });
    });
    it("should fetch all meal report reviews of a user and fetch its food reports", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?fetchFoodReports=true")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          const foodReportLengths = new Set([
            res.body[0].foodReports?.length,
            res.body[1].foodReports?.length,
          ]);
          expect(foodReportLengths).toEqual(new Set([0, 1]));
        });
    });
    it("should fetch all meal report reviews of a user and not fetch its food reports", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?fetchFoodReports=false")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].foodReports).toBeUndefined();
        });
    });
    it("should fetch all pending meal report reviews of a user", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?pending=true")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toEqual(mealReportReview2.id);
        });
    });
    it("should fetch all non-pending meal report reviews of a user", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?pending=false")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toEqual(mealReportReview3.id);
        });
    });
    it("should get all meal report reviews of a user in descending order by default", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?pending=false")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].id).toEqual(mealReportReview3.id);
          expect(res.body[1].id).toEqual(mealReportReview2.id);
        });
    });
    it("should get only one meal report review of a user when applying limit", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?limit=1")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toEqual(mealReportReview3.id);
        });
    });

    // invalid query parameters

    it("should return 400 invalid input when limit is not a number", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?limit=abc")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });
    it("should return 400 invalid input when pending is not a boolean", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?pending=abc")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });
    it("should return 400 invalid input when fetchFoodReports is not a boolean", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      request(app.getHttpServer())
        .get("/mrr?fetchFoodReports=abc")
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      request(app.getHttpServer()).get("/mrr").expect(401);
    });
  });

  describe("GET /mrr/:id", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: user1.appUser.id,
        audioId: "audioId-1",
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
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: user2.appUser.id,
        audioId: "audioId-2",
        foodReports: [],
        mealRecordedAt: new Date(2023, 1, 10),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
    });

    // normal cases and query parameters

    it("should fetch a meal report review of a user given the id", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .get(`/mrr/${mealReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(mealReportReview1.id);
        });
    });
    it("should fetch a meal report review with its food reports", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .get(`/mrr/${mealReportReview1.id}?fetchFoodReports=true`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(mealReportReview1.id);
          expect(res.body.foodReports).toHaveLength(1);
        });
    });
    it("should fetch a meal report review without its food reports", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .get(`/mrr/${mealReportReview1.id}?fetchFoodReports=false`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(mealReportReview1.id);
          expect(res.body.foodReports).toBeUndefined();
        });
    });
    it("should not fetch a meal report review if does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .get(`/mrr/829381923-192389`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should not fetch a meal report review of another user", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .get(`/mrr/${mealReportReview2.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      request(app.getHttpServer())
        .get(`/mrr/${mealReportReview1.id}`)
        .expect(401);
    });
  });

  describe("PATCH /mrr/:id", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: user1.appUser.id,
        audioId: "audioId-1",
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
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: user2.appUser.id,
        audioId: "audioId-2",
        foodReports: [],
        mealRecordedAt: new Date(2023, 1, 10),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
    });

    // positive cases

    it("should update a meal report review of a user given the id", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .patch(`/mrr/${mealReportReview1.id}`)
        .send({
          pending: false,
        })
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(mealReportReview1.id);
          expect(res.body.pending).toEqual(false);
        });
    });

    // negative cases

    it("should return 404 not found when the meal report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .patch(`/mrr/829381923-192389`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should return 404 not found when the user of the meal report review is not the owner", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .patch(`/mrr/${mealReportReview2.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    // invalid data

    it("should return 400 invalid input when pending is not a boolean", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .patch(`/mrr/${mealReportReview1.id}`)
        .send({
          pending: "abc",
        })
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      request(app.getHttpServer())
        .patch(`/mrr/${mealReportReview1.id}`)
        .expect(401);
    });
  });

  describe("DELETE /mrr/:id", () => {
    let mealReportReview1: MealReportReview;
    let mealReportReview2: MealReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: user1.appUser.id,
        audioId: "audioId-1",
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
      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: user2.appUser.id,
        audioId: "audioId-2",
        foodReports: [],
        mealRecordedAt: new Date(2023, 1, 10),
      });
      mealReportReview2 = await mealReportReviewUseCase.create(
        mealReportReviewInput2
      );
    });

    // positive cases

    it("should delete a meal report review of a user given the id", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .delete(`/mrr/${mealReportReview1.id}`)
        .send({
          pending: false,
        })
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(204);
    });

    // negative cases

    it("should return 404 when the meal report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .delete(`/mrr/829381923-192389`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should return 404 not found when the user of the meal report review is not the owner", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      request(app.getHttpServer())
        .delete(`/mrr/${mealReportReview2.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      request(app.getHttpServer())
        .delete(`/mrr/${mealReportReview1.id}`)
        .expect(401);
    });
  });
});
