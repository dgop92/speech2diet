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
import { FoodReportReview } from "@features/foodlog/entities/food-report-review";
import { FoodItem } from "@features/foodlog/entities/food-item";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "main/nest/general-exception-filter";
import { myFoodReportReviewFactory } from "@features/foodlog/factories/food-report-review.factory";
import { FoodReportReviewUseCase } from "@features/foodlog/use-cases/food-report-review.use-case";
import { myFoodItemFactory } from "@features/foodlog/factories/food-item.factory";
import { FoodItemUseCase } from "@features/foodlog/use-cases/food-item.use-case";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("food report review (e2e)", () => {
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

    const foodReportReviewFactory = myFoodReportReviewFactory(
      TestDBHelper.instance.firestoreClient
    );
    const foodReportReviewUseCase =
      foodReportReviewFactory.foodReportReviewUseCase;
    (foodReportReviewUseCase as FoodReportReviewUseCase).setDependencies(
      mealReportReviewUseCase
    );

    const foodItemFactory = myFoodItemFactory(
      TestDBHelper.instance.firestoreClient
    );
    const foodItemUseCase = foodItemFactory.foodItemUseCase;
    (foodItemUseCase as FoodItemUseCase).setDependencies(
      mealReportReviewUseCase
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
      providers: [
        {
          provide: APP_FILTER,
          useClass: AllExceptionsFilter,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
    await TestAuthDBHelper.instance.teardownTestAuthDB();
    await app.close();
  });

  describe("GET /frr", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;
    let foodReportReview2: FoodReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: user1.appUser.id,
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
          appUserId: user2.appUser.id,
          audioId: "audio-id-2",
          foodReports: [],
          mealRecordedAt: new Date(),
        })
      );
    });

    // positive cases

    it("should fetch all food report reviews of a meal report review", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr?mrrId=${mealReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          const expectedIds = new Set([
            foodReportReview1.id,
            foodReportReview2.id,
          ]);
          const actualIds = new Set(
            res.body.map((frr: FoodReportReview) => frr.id)
          );
          expect(actualIds).toEqual(expectedIds);
        });
    });

    // negative cases

    it("should return 404 not found when the meal report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr?mrrId=123012930123-123`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    it("should return 404 not found when the user of the meal report review is not the owner", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr?mrrId=${mealReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    // negative cases - invalid input

    it("should return 400 invalid input when mrrId is not provided", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      await request(app.getHttpServer())
        .get(`/frr/${mealReportReview1.id}`)
        .expect(401);
    });
  });

  describe("GET /frr/:id", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;

    beforeAll(async () => {
      await deleteAllRecords();
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: user1.appUser.id,
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
      await mealReportReviewUseCase.create(
        createInputMealReportReview({
          appUserId: user2.appUser.id,
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

    // positive cases

    it("should fetch a food report review of a meal report review", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr/${foodReportReview1.id}?mrrId=${mealReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(foodReportReview1.id);
        });
    });

    // negative cases

    it("should return 404 not found when the meal report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr/${foodReportReview1.id}?mrrId=123012930123-123`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should return 404 not found when the user of the food report review is not the owner", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr/${foodReportReview1.id}?mrrId=${mealReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    // negative cases - invalid input

    it("should return 400 invalid input when mrrId is not provided", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .get(`/frr/${foodReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      await request(app.getHttpServer())
        .get(`/frr/${foodReportReview1.id}?mrrId=${mealReportReview1.id}`)
        .expect(401);
    });
  });

  describe("DELETE /frr/:id", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const foodReportInput = createInputTestFoodReport({
        foundFoodItem: createInputTestFoodItem(),
        suggestions: [createInputTestFoodItem(), createInputTestFoodItem()],
      });
      const mealReportReviewInput = createInputMealReportReview({
        appUserId: user1.appUser.id,
        audioId: "audio-id-1",
        foodReports: [foodReportInput],
        mealRecordedAt: new Date(),
      });
      mealReportReview1 = await mealReportReviewUseCase.create(
        mealReportReviewInput
      );
      foodReportReview1 = mealReportReview1.foodReports![0];
    });

    // positive cases

    it("should delete a food report review of a meal report review", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .delete(`/frr/${foodReportReview1.id}?mrrId=${mealReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(204);
    });

    // negative cases

    it("should return 404 not found when the meal report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .delete(`/frr/${foodReportReview1.id}?mrrId=123012930123-123`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should return 404 not found when the user of the food report review is not the owner", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      await request(app.getHttpServer())
        .delete(`/frr/${foodReportReview1.id}?mrrId=${mealReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    // negative cases - invalid input

    it("should return 400 invalid input when mrrId is not provided", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .delete(`/frr/${foodReportReview1.id}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      await request(app.getHttpServer())
        .delete(`/frr/${mealReportReview1.id}`)
        .expect(401);
    });
  });

  describe("PATCH /frr/:id/change-food", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;
    let suggestion1: FoodItem;

    let mealReportReview2: MealReportReview;
    let foodReportReview2: FoodReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: user1.appUser.id,
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
      suggestion1 = foodReportReview1.systemResult.suggestions![0];

      const mealReportReviewInput2 = createInputMealReportReview({
        appUserId: user2.appUser.id,
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
    });

    // positive cases

    it("should update the 'found food' by one of the suggestions", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/change-food?mrrId=${mealReportReview1.id}&suggestionId=${suggestion1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(suggestion1.id);
        });
    });

    // negative cases

    it("should return 404 not found when the meal report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/change-food?mrrId=123012930123-123&suggestionId=${suggestion1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should return 404 not found when the food report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/asjdk28-1234/change-food?mrrId=${mealReportReview1.id}&suggestionId=${suggestion1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should return 404 not found when the suggestion does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/change-food?mrrId=${mealReportReview1.id}&suggestionId=123012930123-123`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });
    it("should return 404 not found when the user of the food report review is not the owner", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/change-food?mrrId=${mealReportReview1.id}&suggestionId=${suggestion1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(404);
    });

    // test invalid input

    it("should return 400 invalid input when mrrId is not provided", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/change-food?suggestionId=${suggestion1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    });
    // TODO: re add this test when suggestionId is send through the body
    /* it("should return 400 invalid input when suggestionId is not provided", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/change-food?mrrId=${mealReportReview1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .expect(400);
    }); */

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/change-food?mrrId=${mealReportReview1.id}&suggestionId=${suggestion1.id}`
        )
        .expect(401);
    });
  });

  describe("PATCH /frr/:id/found-food", () => {
    let mealReportReview1: MealReportReview;
    let foodReportReview1: FoodReportReview;

    beforeEach(async () => {
      await deleteAllRecords();
      const mealReportReviewInput1 = createInputMealReportReview({
        appUserId: user1.appUser.id,
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
        appUserId: user2.appUser.id,
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

    // positive cases

    it("should update the 'found food' amount", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReview1.id}/found-food?mrrId=${mealReportReview1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .send({
          amount: 150,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(
            foodReportReview1.systemResult.foundFoodItem!.id
          );
          expect(res.body.amount).toBe(150);
        });
    });

    // negative cases

    it("should return 404 not found when the meal report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      const foodReportReviewId = foodReportReview1.id;
      await request(app.getHttpServer())
        .patch(`/frr/${foodReportReviewId}/found-food?mrrId=123012930123-123`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .send({
          amount: 150,
        })
        .expect(404);
    });
    it("should return 404 not found when the food report review does not exist", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      const foodReportReviewId = "asjdk28-1234";
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReviewId}/found-food?mrrId=${mealReportReview1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .send({
          amount: 150,
        })
        .expect(404);
    });
    it("should return 404 not found when the user of the food report review is not the owner", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user2.authUser.id
      );
      const foodReportReviewId = foodReportReview1.id;
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReviewId}/found-food?mrrId=${mealReportReview1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .send({
          amount: 150,
        })
        .expect(404);
    });

    // invalid input

    it("should return 400 invalid input when mrrId is not provided", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      const foodReportReviewId = foodReportReview1.id;
      await request(app.getHttpServer())
        .patch(`/frr/${foodReportReviewId}/found-food`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .send({
          amount: 150,
        })
        .expect(400);
    });
    it("should return 400 invalid input when amount is negative", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      const foodReportReviewId = foodReportReview1.id;
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReviewId}/found-food?mrrId=${mealReportReview1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .send({
          amount: -150,
        })
        .expect(400);
    });
    it("should return 400 invalid input when amount is not a number", async () => {
      const token = await TestAuthDBHelper.instance.getAuthTokenForUser(
        user1.authUser.id
      );
      const foodReportReviewId = foodReportReview1.id;
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReviewId}/found-food?mrrId=${mealReportReview1.id}`
        )
        .set({
          Authorization: `Bearer ${token}`,
        })
        .send({
          amount: "abc",
        })
        .expect(400);
    });

    // test authentication

    it("should return 401 unauthorized when user is not authenticated", async () => {
      const foodReportReviewId = foodReportReview1.id;
      await request(app.getHttpServer())
        .patch(
          `/frr/${foodReportReviewId}/found-food?mrrId=${mealReportReview1.id}`
        )
        .send({
          amount: 150,
        })
        .expect(401);
    });
  });
});
