import { FoodSource } from "@features/foodlog/entities/food";
import {
  DBLookupPreference,
  MealReportReview,
} from "@features/foodlog/entities/meal-report-review";
import { myMealReportReviewFactory } from "@features/foodlog/factories/meal-report-review.factory";
import { MealReportReviewCreateInput } from "@features/foodlog/schema-types";

const fakeFoods = [
  {
    id: "1",
    foodName: "Crunchy Delight",
    otherNames: ["Crispy Joy", "Snacktastic"],
    description: ["Cooked", "crunchy", "flavorful"],
    portionReference: 50,
    portionUnit: "grams",
    foodSource: FoodSource.SYSTEM_DB,
    calories: 200,
    protein: 4,
    fat: 10,
    carbohydrates: 25,
  },
  {
    id: "2",
    foodName: "Zesty Zoodle Bowl",
    otherNames: ["Spicy Noodle Delight", "Veggie Zing"],
    description: ["Raw zucchini noodles with a tangy sauce"],
    portionReference: 150,
    portionUnit: "grams",
    foodSource: FoodSource.USER_DB,
    calories: 120,
    protein: 3,
    fat: 5,
    carbohydrates: 18,
  },
  {
    id: "3",
    foodName: "Creamy Dream Cake",
    otherNames: ["Velvet Bliss", "Dessert Supreme"],
    description: ["Rich and creamy cake with layers of frosting"],
    portionReference: 100,
    portionUnit: "grams",
    foodSource: FoodSource.SYSTEM_DB,
    calories: 350,
    protein: 5,
    fat: 20,
    carbohydrates: 40,
  },
];

function getmmrData(userId1: string, userId2: string) {
  const mmrData: MealReportReviewCreateInput[] = [
    {
      data: {
        audioId: "beee-4b97",
        dbLookupPreference: DBLookupPreference.SYSTEM_DB,
        foodReports: [],
        mealRecordedAt: new Date("2021-12-01T12:00:00.000Z"),
        rawTranscript: "hellow",
        userId: userId1,
      },
    },
    {
      data: {
        audioId: "beee-4b97",
        dbLookupPreference: DBLookupPreference.SYSTEM_DB,
        mealRecordedAt: new Date("2021-10-01T12:00:00.000Z"),
        foodReports: [
          {
            systemResult: {
              foundFoodItem: {
                amount: 64,
                food: fakeFoods[0],
                score: 0.9,
                unitWasTransformed: false,
              },
              suggestions: [
                {
                  amount: 12,
                  food: fakeFoods[1],
                  score: 0.9,
                  unitWasTransformed: false,
                },
              ],
            },
            userReport: {
              amount: 64,
              description: ["Cooked", "crunchy", "flavorful"],
              foodName: "Crunchy Delight",
              unit: "g",
            },
          },
        ],
        rawTranscript: "hellow",
        userId: userId1,
      },
    },
    {
      data: {
        audioId: "beee-4b97",
        dbLookupPreference: DBLookupPreference.SYSTEM_DB,
        mealRecordedAt: new Date("2021-09-01T12:00:00.000Z"),
        foodReports: [
          {
            systemResult: {
              foundFoodItem: null,
              suggestions: [
                {
                  amount: 12,
                  food: fakeFoods[1],
                  score: 0.9,
                  unitWasTransformed: false,
                },
              ],
            },
            userReport: {
              amount: 64,
              description: ["Cooked", "crunchy", "flavorful"],
              foodName: "Crunchy Delight",
              unit: "g",
            },
          },
        ],
        rawTranscript: "hellow",
        userId: userId1,
      },
    },
    {
      data: {
        audioId: "beee-4b97",
        dbLookupPreference: DBLookupPreference.SYSTEM_DB,
        mealRecordedAt: new Date("2021-02-01T12:00:00.000Z"),
        foodReports: [
          {
            systemResult: {
              foundFoodItem: null,
              suggestions: [],
            },
            userReport: {
              amount: 64,
              description: ["Cooked", "crunchy", "flavorful"],
              foodName: "Crunchy Delight",
              unit: "g",
            },
          },
        ],
        rawTranscript: "hellow",
        userId: userId1,
      },
    },
    {
      data: {
        audioId: "beee-4b97",
        dbLookupPreference: DBLookupPreference.SYSTEM_DB,
        foodReports: [],
        mealRecordedAt: new Date("2021-08-01T12:00:00.000Z"),
        rawTranscript: "hellow",
        userId: userId2,
      },
    },
  ];
  return mmrData;
}

export async function setupMrrData(userId1: string, userId2: string) {
  const { mealReportReviewUseCase } = myMealReportReviewFactory();
  const mmrData = getmmrData(userId1, userId2);
  const mmrPromises = mmrData.map((mmr) => mealReportReviewUseCase.create(mmr));
  await Promise.all(mmrPromises);
}
